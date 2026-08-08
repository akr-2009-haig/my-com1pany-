import {create} from 'zustand';
const useServicesStore=create(set=>({ services:[], setServices:(s)=>set({services:s}) }));
export default useServicesStore;
