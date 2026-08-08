import {create} from 'zustand';
const useSlidesStore=create(set=>({ slides:[], setSlides:(s)=>set({slides:s}) }));
export default useSlidesStore;
