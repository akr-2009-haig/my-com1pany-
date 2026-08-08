export default function AboutPreview(){
  return <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
      <div className="relative"><img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600" alt="about" className="rounded-xl shadow-lg -rotate-1"/><div className="absolute -z-10 -bottom-4 -left-4 w-full h-full bg-[#00BCD4]/10 rounded-xl"></div></div>
      <div><p className="text-[#00BCD4] font-medium">من نحن</p><h2 className="text-3xl font-bold mt-2">شركة رائدة في الحلول البرمجية</h2><p className="text-gray-600 mt-4">نقدم حلول تقنية متكاملة تساعد الشركات على النمو والتحول الرقمي بكفاءة واحترافية.</p><ul className="mt-6 space-y-2">{["فريق محترف","جودة عالية","التزام بالمواعيد"].map(t=> <li key={t} className="flex gap-2"><span className="text-[#00BCD4]">✓</span>{t}</li>)}</ul><a href="/about" className="btn-primary inline-block mt-6">اقرأ المزيد</a></div>
    </div>
  </section>
}
