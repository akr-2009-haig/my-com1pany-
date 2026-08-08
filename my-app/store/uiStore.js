import {create} from 'zustand';
const useUIStore=create(set=>({ sidebarOpen:true, toggleSidebar:()=>set(s=>({sidebarOpen:!s.sidebarOpen})) }));
export default useUIStore;
