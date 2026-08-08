"use client";
import {useParams} from "next/navigation";
export default function ServiceDetail(){ const {slug}=useParams(); return <div className="max-w-7xl mx-auto px-4 py-16"><h1 className="text-3xl font-bold">خدمة: {slug}</h1><p className="text-gray-600 mt-4">وصف تفصيلي ديناميكي من لوحة التحكم مع محرر WYSIWYG</p></div> }
