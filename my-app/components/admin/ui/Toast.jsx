"use client";
export default function Toast({message,type}){
  if(!message) return null;
  const bg= type==="error"?"bg-red-500": type==="warn"?"bg-orange-500":"bg-green-500";
  return <div className={`fixed top-4 right-4 ${bg} text-white px-4 py-3 rounded-lg shadow z-50`}>{message}</div>
}
