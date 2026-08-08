import './globals.css';
import Script from 'next/script';
import { getSettings } from '../lib/data';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WhatsappButton from '../components/layout/WhatsappButton';
import ScrollToTop from '../components/layout/ScrollToTop';
import { ToastProvider } from '../components/shared/ToastProvider';
import RealtimeRefresher from '../components/shared/RealtimeRefresher';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings();
  const seo = s.seo || {};
  const title = seo.title || s.siteName || 'شركة برمجية';
  const description = seo.description || s.description || '';
  return {
    metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
    title: { default: title, template: `%s | ${s.siteName || ''}` },
    description,
    keywords: seo.keywords || '',
    icons: s.favicon ? { icon: s.favicon } : undefined,
    openGraph: {
      title, description, siteName: s.siteName, type: 'website', locale: 'ar_SA',
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
    },
    twitter: { card: 'summary_large_image', title, description, images: seo.ogImage ? [seo.ogImage] : [] },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const seo = settings.seo || {};
  const lang = settings.languages?.defaultLang || 'ar';
  const dir = lang === 'en' ? 'ltr' : 'rtl';

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.siteName,
    description: settings.description,
    url: process.env.SITE_URL || undefined,
    logo: settings.logo || undefined,
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    address: settings.address ? { '@type': 'PostalAddress', streetAddress: settings.address } : undefined,
    sameAs: Object.values(settings.socials || {}).filter(Boolean),
  };

  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#00BCD4" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="min-h-screen flex flex-col">
        {seo.gtm ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${seo.gtm}`}
              height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="gtm"
            />
          </noscript>
        ) : null}

        <ToastProvider>
          <Header settings={settings} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <WhatsappButton settings={settings} />
          <ScrollToTop />
          <RealtimeRefresher />
        </ToastProvider>

        {seo.ga ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${seo.ga}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${seo.ga}');`}
            </Script>
          </>
        ) : null}
        {seo.gtm ? (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${seo.gtm}');`}
          </Script>
        ) : null}
        {seo.pixel ? (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${seo.pixel}');fbq('track','PageView');`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
