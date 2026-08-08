export default function FilterButtons({categories,active,onChange}){
  return <div className="flex gap-2 flex-wrap justify-center">{categories.map(c=> <button key={c} onClick={()=>onChange(c)} className={`px-4 py-2 rounded-full border text-sm ${active===c?'bg-[#00BCD4] text-white border-[#00BCD4]':'bg-white text-gray-600'}`}>{c==="all"?"الكل":c}</button>)}</div>
}
