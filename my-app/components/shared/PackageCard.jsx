export default function PackageCard({pkg,yearly}){
  const price = yearly ? (pkg.priceYearly||pkg.priceMonthly*10) : pkg.priceMonthly;
  return <div className={`card p-6 relative ${pkg.isPopular?'border-[#00BCD4] border-2 scale-105':''}`}>
    {pkg.isPopular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00BCD4] text-white text-xs px-3 py-1 rounded-full">الأكثر طلباً</span>}
    <h3 className="font-bold text-lg">{pkg.name}</h3>
    <div className="mt-2"><span className="text-3xl font-black text-[#00BCD4]">{price}</span><span className="text-gray-400 text-sm">/{yearly?'سنويا':'شهريا'}</span></div>
    <hr className="my-4"/>
    <ul className="space-y-2 text-sm">{(pkg.features||[]).map((f,i)=> <li key={i} className="flex gap-2"><span className={f.included?'text-[#00BCD4]':'text-gray-300'}>{f.included?'✓':'✗'}</span>{f.text}</li>)}</ul>
    <a href={pkg.buttonLink||"/quote"} className="btn-primary block text-center mt-6">اطلب الآن</a>
  </div>
}
