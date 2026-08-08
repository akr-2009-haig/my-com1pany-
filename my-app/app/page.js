import { getHomeData, getServices } from '../lib/data';
import HeroSlider from '../components/home/HeroSlider';
import StatsBar from '../components/home/StatsBar';
import AboutPreview from '../components/home/AboutPreview';
import ServicesPreview from '../components/home/ServicesPreview';
import WhyUs from '../components/home/WhyUs';
import PortfolioPreview from '../components/home/PortfolioPreview';
import Testimonials from '../components/home/Testimonials';
import PricingPreview from '../components/home/PricingPreview';
import PartnersLogos from '../components/home/PartnersLogos';
import BlogPreview from '../components/home/BlogPreview';
import CtaSection from '../components/home/CtaSection';
import ContactPreview from '../components/home/ContactPreview';

export const dynamic = 'force-dynamic';

const FALLBACK_ORDER = ['hero', 'stats', 'about', 'services', 'whyus', 'portfolio',
  'testimonials', 'pricing', 'partners', 'blog', 'cta', 'contact'];

export default async function HomePage() {
  const data = await getHomeData();
  const allServices = await getServices({ limit: 0 });

  const blocks = {
    hero: <HeroSlider slides={data.slides} />,
    stats: <StatsBar stats={data.stats} />,
    about: <AboutPreview data={data.aboutSection?.data} />,
    services: <ServicesPreview services={data.services} />,
    whyus: <WhyUs data={data.whyus?.data} />,
    portfolio: <PortfolioPreview projects={data.projects} categories={data.categories} />,
    testimonials: <Testimonials items={data.testimonials} />,
    pricing: <PricingPreview packages={data.packages} showToggle={data.settings?.home?.showPricingToggle !== false} />,
    partners: <PartnersLogos partners={data.partners} />,
    blog: <BlogPreview posts={data.posts} />,
    cta: <CtaSection data={data.cta?.data} />,
    contact: <ContactPreview settings={data.settings} config={data.contactPage?.data} services={allServices} />,
  };

  const visible = (data.sections || []).filter((s) => s.isVisible !== false).map((s) => s.key);
  const order = visible.length ? visible : FALLBACK_ORDER;

  return <>{order.map((key) => (blocks[key] ? <div key={key}>{blocks[key]}</div> : null))}</>;
}
