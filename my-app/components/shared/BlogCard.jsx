export default function BlogCard({post}){
  const img = post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600";
  return <div className="card overflow-hidden hover:-translate-y-1 transition">
    <div className="relative h-48 overflow-hidden"><img src={img} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition duration-500"/><span className="absolute top-3 left-3 bg-[#00BCD4] text-white text-xs px-2 py-1 rounded">{post.category?.name||"عام"}</span></div>
    <div className="p-4"><div className="text-xs text-gray-400 flex gap-2"><span>📅 {new Date(post.createdAt||Date.now()).toLocaleDateString()}</span></div><h3 className="font-bold mt-2 line-clamp-2">{post.title}</h3><p className="text-gray-500 text-sm mt-2 line-clamp-3">{post.excerpt||post.content?.slice(0,100)||"مقتطف المقال..."}</p><a href={`/blog/${post.slug||post._id}`} className="text-[#00BCD4] text-sm mt-3 inline-block">اقرأ المزيد ←</a></div>
  </div>
}
