"use client";
export default function ToggleSwitch({checked,onChange}){
  return <button onClick={()=>onChange(!checked)} className={`w-11 h-6 rounded-full relative transition ${checked?'bg-[#00BCD4]':'bg-gray-300'}`}><span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${checked?'right-0.5':'left-0.5'}`}></span></button>
}
