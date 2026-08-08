"use client";
import { useEffect } from "react";
import useSocket from "./useSocket";
export default function useRealtime(event, handler){
  const socket=useSocket();
  useEffect(()=>{
    if(!socket) return;
    socket.on(event, handler);
    return ()=> socket.off(event, handler);
  },[socket,event,handler]);
}
