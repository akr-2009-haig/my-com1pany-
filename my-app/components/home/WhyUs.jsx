export default function WhyUs(){
  return <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
      <div><p className="text-[#00BCD4]">لماذا نحن</p><h2 className="text-3xl font-bold mt-2">لماذا تختار شركتنا؟</h2><p className="text-gray-600 mt-3">نتميز بخبرة واسعة وفريق محترف يضمن تسليم مشاريع عالية الجودة في الوقت المحدد.</p>
        <div className="mt-6 space-y-4">{[{t:"جودة مضمونة",d:"نلتزم بأعلى معايير الجودة"},{t:"دعم 24/7",d:"فريق دعم متواجد دائما"}].map(f=> <div key={f.t} className="flex gap-3 p-3 bg-gray-50 rounded-lg"><span className="w-10 h-10 rounded-lg bg-[#00BCD4]/10 text-[#00BCD4] grid place-items-center">✓</span><div><b>{f.t}</b><p className="text-sm text-gray-500">{f.d}</p></div></div>)}</div>
      </div>
      <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600" alt="why" className="rounded-xl shadow"/>
    </div>
  </section>
}
