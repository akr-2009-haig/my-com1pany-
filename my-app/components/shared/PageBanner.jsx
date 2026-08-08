export default function PageBanner({title,breadcrumb}){
  return <div className="relative h-64 grid place-items-center text-white" style={{backgroundImage:"url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600)", backgroundSize:"cover"}}>
    <div className="absolute inset-0 bg-black/60"></div>
    <div className="relative text-center"><h1 className="text-4xl font-black">{title}</h1>{breadcrumb && <p className="text-white/70 mt-2">{breadcrumb}</p>}</div>
  </div>
}
