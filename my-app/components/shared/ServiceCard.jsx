export default function ServiceCard({service}){
  return <div className="card p-6 hover:-translate-y-1 hover:shadow-lg transition group border-t-4 border-transparent hover:border-[#00BCD4]">
    <div className="w-12 h-12 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] grid place-items-center text-xl group-hover:scale-110 transition">{service.icon||"🚀"}</div>
    <h3 className="font-bold mt-4">{service.title}</h3>
    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{service.shortDesc||service.description||"وصف مختصر للخدمة"}</p>
    <a href={`/services/${service.slug||service._id}`} className="text-[#00BCD4] text-sm mt-3 inline-block">المزيد ←</a>
  </div>
}
