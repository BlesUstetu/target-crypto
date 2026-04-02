
import {useEffect} from "react";
import {useStore} from "../store";
let h=[];
export default function useSMC(){
 const price=useStore(s=>s.price);
 const setSMC=useStore(s=>s.setSMC);
 useEffect(()=>{
  if(!price)return;
  h.push(price); if(h.length>50)h.shift();
  const high=Math.max(...h),low=Math.min(...h);
  let sweep=null;
  if(price>=high*0.999)sweep="UP";
  if(price<=low*1.001)sweep="DOWN";
  setSMC({high,low,sweep});
 },[price]);
}
