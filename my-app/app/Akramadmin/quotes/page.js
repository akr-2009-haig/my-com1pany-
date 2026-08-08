"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api"; import DataTable from "../../../components/admin/ui/DataTable";
export default function Quotes(){
  const [rows,setRows]=useState([]); useEffect(()=>{api.get("/quotes").then(r=>setRows(r.data)).catch(()=>{});},[]);
  return <div><h1 className="text-2xl font-bold mb-4">طلبات عروض الأسعار</h1><DataTable columns={[{key:"name",label:"الاسم"},{key:"company",label:"الشركة"},{key:"projectType",label:"نوع المشروع"},{key:"budget",label:"الميزانية"},{key:"status",label:"الحالة"}]} rows={rows} /></div>
}
