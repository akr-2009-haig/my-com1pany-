"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api"; import DataTable from "../../../components/admin/ui/DataTable";
export default function Messages(){
  const [rows,setRows]=useState([]); const load=()=> api.get("/messages").then(r=>setRows(r.data)).catch(()=>{});
  useEffect(()=>{load()},[]);
  return <div><h1 className="text-2xl font-bold mb-4">رسائل التواصل</h1><DataTable columns={[{key:"name",label:"الاسم"},{key:"email",label:"البريد"},{key:"phone",label:"الهاتف"},{key:"message",label:"الرسالة"},{key:"createdAt",label:"التاريخ", render:v=> new Date(v).toLocaleString()}]} rows={rows} /></div>
}
