export default function Badge({children,color}){
  const c=color==="green"?"bg-green-100 text-green-600": color==="red"?"bg-red-100 text-red-600": color==="yellow"?"bg-yellow-100 text-yellow-600":"bg-blue-100 text-blue-600";
  return <span className={`px-2 py-1 rounded-full text-xs ${c}`}>{children}</span>
}
