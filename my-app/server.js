
require('dotenv').config();
const express=require('express');
const next=require('next');
const http=require('http');
const { Server }=require('socket.io');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const helmet=require('helmet');
const morgan=require('morgan');
const connectDB=require('./lib/db');
const { setIO }=require('./lib/socket');
const { apiLimiter, securityMiddlewares }=require('./middleware/security');
const blockCheck=require('./middleware/blockCheck');
const maintenanceCheck=require('./middleware/maintenance');

const dev=process.env.NODE_ENV!=='production';
const port=parseInt(process.env.PORT||"3000",10);
const app=next({dev, dir:"."});
const handle=app.getRequestHandler();

app.prepare().then(()=>{
  const server=express();
  server.set('trust proxy', 1);
  server.use(helmet({
    contentSecurityPolicy: dev ? false : {
      directives:{
        defaultSrc:["'self'"],
        scriptSrc:["'self'","'unsafe-inline'","https://res.cloudinary.com"],
        styleSrc:["'self'","'unsafe-inline'","https://fonts.googleapis.com"],
        imgSrc:["'self'","data:","https:","blob:"],
        connectSrc:["'self'","https:","wss:"],
        fontSrc:["'self'","https://fonts.gstatic.com","data:"]
      }
    },
    crossOriginEmbedderPolicy:false,
    hsts:{maxAge:31536000, includeSubDomains:true, preload:true}
  }));
  server.use(cors({origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true, credentials:true}));
  server.use(express.json({limit:"10mb"}));
  server.use(express.urlencoded({extended:true, limit:"10mb"}));
  server.use(cookieParser());
  if(dev) server.use(morgan('dev'));
  securityMiddlewares(server);
  server.use(blockCheck);
  server.use(maintenanceCheck);
  server.use('/api/', apiLimiter);

  // Connect DB (non-blocking)
  connectDB().catch(e=> console.error("DB connect error",e.message));

  // API routes
  server.use('/api/auth', require('./routes/auth.routes'));
  server.use('/api/slides', require('./routes/slides.routes'));
  server.use('/api/services', require('./routes/services.routes'));
  server.use('/api/projects', require('./routes/projects.routes'));
  server.use('/api/packages', require('./routes/packages.routes'));
  server.use('/api/posts', require('./routes/posts.routes'));
  server.use('/api/comments', require('./routes/comments.routes'));
  server.use('/api/partners', require('./routes/partners.routes'));
  server.use('/api/testimonials', require('./routes/testimonials.routes'));
  server.use('/api/team', require('./routes/team.routes'));
  server.use('/api/timeline', require('./routes/timeline.routes'));
  server.use('/api/jobs', require('./routes/jobs.routes'));
  server.use('/api/stats', require('./routes/stats.routes'));
  server.use('/api/messages', require('./routes/messages.routes'));
  server.use('/api/quotes', require('./routes/quotes.routes'));
  server.use('/api/applications', require('./routes/applications.routes'));
  server.use('/api/faq', require('./routes/faq.routes'));
  server.use('/api/menus', require('./routes/menus.routes'));
  server.use('/api/banners', require('./routes/banners.routes'));
  server.use('/api/sections', require('./routes/sections.routes'));
  server.use('/api/settings', require('./routes/settings.routes'));
  server.use('/api/users', require('./routes/users.routes'));
  server.use('/api/upload', require('./routes/upload.routes'));
  server.use('/api/analytics', require('./routes/analytics.routes'));
  server.use('/api/security', require('./routes/security.routes'));
  server.use('/api/backup', require('./routes/backup.routes'));

  server.get('/api/health',(req,res)=> res.json({ok:true, time:new Date().toISOString()}));

  // Next.js handler for all other routes
  server.all('*', (req,res)=> handle(req,res));

  const httpServer=http.createServer(server);
  const io=new Server(httpServer,{ cors:{ origin:"*", methods:["GET","POST","PUT","DELETE"] }});
  setIO(io);
  io.on('connection', socket=>{
    console.log('socket connected', socket.id);
    socket.on('disconnect',()=> console.log('socket disconnected', socket.id));
  });

  // error handler
  server.use(require('./middleware/errorHandler'));

  httpServer.listen(port, '0.0.0.0', ()=> console.log(`> Ready on http://localhost:${port} (${dev?'dev':'prod'})`));
});
