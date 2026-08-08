"use client";
export default function ConfirmModal({open,title,onConfirm,onCancel}){
  if(!open) return null;
  return <div className="fixed inset-0 bg-black/50 grid place-items-center z-50"><div className="bg-white p-6 rounded-xl w-full max-w-sm"><h3 className="font-bold">{title||"هل أنت متأكد؟"}</h3><div className="flex gap-2 mt-4 justify-end"><button onClick={onCancel} className="px-4 py-2 border rounded-lg">إلغاء</button><button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg">نعم، احذف</button></div></div></div>
}
