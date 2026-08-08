"use client";
export default function MultiImageUploader({values,onChange}){
  return <div className="border-2 border-dashed rounded-xl p-4"><p className="text-sm text-gray-400">رفع صور متعددة</p><input type="file" multiple accept="image/*" onChange={e=>{}} className="mt-2"/></div>
}
