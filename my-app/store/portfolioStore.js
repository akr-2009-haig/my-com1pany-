import {create} from 'zustand';
const usePortfolioStore=create(set=>({ projects:[], setProjects:(p)=>set({projects:p}) }));
export default usePortfolioStore;
