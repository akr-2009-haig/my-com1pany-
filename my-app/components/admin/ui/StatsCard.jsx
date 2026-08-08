export default function StatsCard({title,value,change,color}){
  return <div className="bg-white rounded-xl p-6 border-t-4" style={{borderColor:color}}>
    <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">{title}</span><span className="w-8 h-8 rounded-full grid place-items-center text-white" style={{background:color}}>●</span></div>
    <div className="text-2xl font-black mt-2">{value}</div>
    <div className={`text-xs mt-1 ${change?.startsWith("+")?"text-green-500":"text-red-500"}`}>{change} عن الشهر السابق</div>
  </div>
}
