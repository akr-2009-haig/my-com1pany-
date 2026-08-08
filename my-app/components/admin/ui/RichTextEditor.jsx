"use client";
export default function RichTextEditor({value,onChange}){
  return <textarea value={value||""} onChange={e=>onChange(e.target.value)} className="w-full border rounded-lg p-3 h-40" placeholder="محرر نصوص غني WYSIWYG - يدعم HTML"></textarea>
}
