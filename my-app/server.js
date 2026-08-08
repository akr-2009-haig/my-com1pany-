require('dotenv').config();

const express = require('express');
const next = require('next');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');

const { connect, getDriver, flushSync } = require('./lib/datastore');
const { setIO } = require('./lib/socket');
const { apiLimiter, securityMiddlewares } = require('./middleware/security');
const blockCheck = require('./middleware/blockCheck');
const maintenanceCheck = require('./middleware/maintenance');
const visitTracker = require('./middleware/visitTracker');
const { errorHandler } = require('./middleware/errorHandler');
const buildRoutes = require('./routes');
const seed = require('./scripts/seed');
const backup = require('./controllers/backup.controller');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

async function main() {
  await connect();
  await seed.ensureBaseData();
  if (process.env.SEED_DEMO === 'true' && process.env.NODE_ENV !== 'production') {
    await seed.seedDemoContent();
  }

  await app.prepare();
  const server = express();
  server.set('trust proxy', 1);
  server.disable('x-powered-by');

  server.use(helmet({
    contentSecurityPolicy: dev ? false : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://connect.facebook.net', 'https://www.google.com', 'https://www.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        frameSrc: ["'self'", 'https://www.google.com', 'https://www.youtube.com', 'https://maps.google.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: dev ? false : { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: false, // handled in next.config.js (SAMEORIGIN) so previews work
  }));

  server.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : true,
    credentials: true,
  }));
  server.use(express.json({ limit: '12mb' }));
  server.use(express.urlencoded({ extended: true, limit: '12mb' }));
  server.use(cookieParser());
  if (dev) server.use(morgan('dev'));

  securityMiddlewares(server);
  server.use(blockCheck);
  server.use('/api/', apiLimiter);

  server.get('/api/health', (req, res) => res.json({
    ok: true, driver: getDriver(), env: process.env.NODE_ENV || 'development', time: new Date().toISOString(),
  }));

  server.use('/api', buildRoutes());

  // SEO endpoints (must come before the maintenance gate)
  server.get('/robots.txt', require('./lib/seoRoutes').robots);
  server.get('/sitemap.xml', require('./lib/seoRoutes').sitemap);

  server.use(maintenanceCheck);
  server.use(visitTracker);

  server.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), { maxAge: '30d', immutable: true }));

  server.all('*', (req, res) => handle(req, res));

  server.use(errorHandler);

  const httpServer = http.createServer(server);
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*', methods: ['GET', 'POST'] },
    path: '/socket.io',
  });
  setIO(io);
  io.on('connection', (socket) => {
    socket.on('join', (room) => socket.join(String(room)));
  });

  backup.startScheduler();

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`\n  ▲ Ready on http://0.0.0.0:${port}  (${dev ? 'development' : 'production'})`);
    console.log(`  ▸ Admin panel: /Akramadmin`);
    console.log(`  ▸ Data driver: ${getDriver()}\n`);
  });

  const shutdown = () => {
    console.log('\nShutting down…');
    flushSync();
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((e) => {
  console.error('Fatal startup error:', e);
  process.exit(1);
});
