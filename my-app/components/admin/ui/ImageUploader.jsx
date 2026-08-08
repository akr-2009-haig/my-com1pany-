"use client";
export default function ImageUploader({value,onChange}){
  return <div className="border-2 border-dashed rounded-xl p-6 text-center">
    {value? <img src={value} alt="preview" className="h-32 mx-auto rounded"/> : <p className="text-gray-400">اسحب الصورة هنا أو اختر ملف</p>}
    <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files[0]; if(f) onChange(URL.createObjectURL(f)); }} className="mt-3 text-sm"/>
  </div>
}
