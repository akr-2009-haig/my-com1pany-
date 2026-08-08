import {create} from 'zustand';
const useSettingsStore=create(set=>({ settings:null, setSettings:(s)=>set({settings:s}) }));
export default useSettingsStore;
