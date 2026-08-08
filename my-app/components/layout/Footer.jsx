export default function Footer(){
  return <footer className="bg-[#1a1a2e] text-white mt-0">
    <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
      <div><h3 className="font-bold text-lg mb-3">MyCompany</h3><p className="text-gray-400 text-sm">شريكك التقني الموثوق في رحلة التحول الرقمي - حلول برمجية متكاملة.</p><div className="flex gap-2 mt-4">{["F","X","I","L"].map(c=> <span key={c} className="w-8 h-8 rounded-full bg-[#00BCD4] grid place-items-center text-sm">{c}</span>)}</div></div>
      <div><h4 className="font-bold mb-3">روابط سريعة</h4><div className="w-10 h-0.5 bg-[#00BCD4] mb-3"></div><ul className="space-y-2 text-gray-400 text-sm"><li><a href="/" className="hover:text-[#00BCD4]">الرئيسية</a></li><li><a href="/about" className="hover:text-[#00BCD4]">من نحن</a></li><li><a href="/services" className="hover:text-[#00BCD4]">الخدمات</a></li><li><a href="/portfolio" className="hover:text-[#00BCD4]">المشاريع</a></li></ul></div>
      <div><h4 className="font-bold mb-3">خدماتنا</h4><div className="w-10 h-0.5 bg-[#00BCD4] mb-3"></div><ul className="space-y-2 text-gray-400 text-sm"><li>تطوير المواقع</li><li>تطوير التطبيقات</li><li>الأنظمة المتكاملة</li><li>التصميم الإبداعي</li></ul></div>
      <div><h4 className="font-bold mb-3">تواصل معنا</h4><div className="w-10 h-0.5 bg-[#00BCD4] mb-3"></div><p className="text-gray-400 text-sm">📍 الرياض - السعودية</p><p className="text-gray-400 text-sm">📞 +966 500 000 000</p><p className="text-gray-400 text-sm">✉️ info@company.com</p></div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-gray-400 text-sm">جميع الحقوق محفوظة © {new Date().getFullYear()} MyCompany | <a href="/privacy" className="hover:text-white">سياسة الخصوصية</a> - <a href="/terms" className="hover:text-white">الشروط</a></div>
  </footer>
}
