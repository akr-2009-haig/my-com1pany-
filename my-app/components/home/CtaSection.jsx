export default function CtaSection(){
  return <section className="relative py-20 text-center text-white" style={{backgroundImage:"url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600)", backgroundSize:"cover", backgroundPosition:"center"}}>
    <div className="absolute inset-0 bg-[#00BCD4]/80"></div>
    <div className="relative z-10 max-w-3xl mx-auto px-4"><h2 className="text-3xl md:text-4xl font-black">هل لديك مشروع في ذهنك؟</h2><p className="mt-3 text-white/90">فريقنا جاهز لتحويل فكرتك إلى منتج رقمي متكامل</p><div className="flex gap-4 justify-center mt-6"><a href="/contact" className="bg-white text-[#00BCD4] px-6 py-3 rounded-lg font-bold">تواصل معنا</a><a href="/quote" className="border border-white text-white px-6 py-3 rounded-lg">اطلب عرض سعر</a></div></div>
  </section>
}
