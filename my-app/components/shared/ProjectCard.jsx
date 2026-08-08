export default function ProjectCard({project}){
  const img = project.image || (project.images && project.images[0]) || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600";
  return <div className="relative overflow-hidden rounded-xl shadow group h-64">
    <img src={img} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
    <div className="absolute inset-0 bg-[#00BCD4]/80 opacity-0 group-hover:opacity-100 transition grid place-items-center text-white text-center p-4">
      <div><h3 className="font-bold">{project.title}</h3><p className="text-sm text-white/80">{project.category?.name||"عام"}</p><div className="flex gap-2 justify-center mt-3"><span className="w-8 h-8 rounded-full bg-white text-[#00BCD4] grid place-items-center">👁️</span><span className="w-8 h-8 rounded-full bg-white text-[#00BCD4] grid place-items-center">🔗</span></div></div>
    </div>
  </div>
}
