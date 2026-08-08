export default function PieChart(){
  return <div className="grid place-items-center h-48"><div className="w-32 h-32 rounded-full" style={{background:"conic-gradient(#00BCD4 0% 40%, #22c55e 40% 65%, #f97316 65% 85%, #8b5cf6 85% 100%)"}}></div><div className="flex gap-2 text-xs mt-3"><span className="flex gap-1 items-center"><span className="w-2 h-2 bg-[#00BCD4] rounded-full"></span>مباشر</span><span className="flex gap-1 items-center"><span className="w-2 h-2 bg-green-500 rounded-full"></span>بحث</span></div></div>
}
