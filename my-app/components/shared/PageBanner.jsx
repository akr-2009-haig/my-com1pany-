import Breadcrumb from './Breadcrumb';

export default function PageBanner({ title, subtitle, image, breadcrumb = [] }) {
  const bg = image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80';
  return (
    <section className="relative min-h-[240px] md:min-h-[320px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }} aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-dark/85 via-dark/75 to-dark/85" aria-hidden />
      <div className="relative container-app py-14 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">{title}</h1>
        {subtitle && <p className="text-white/80 max-w-2xl mx-auto mb-4">{subtitle}</p>}
        <Breadcrumb items={breadcrumb} light />
      </div>
    </section>
  );
}
