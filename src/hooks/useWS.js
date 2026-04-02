
import {useEffect} from "react";
import {useStore} from "../store";
export default function useWS(){
 const setPrice=useStore(s=>s.setPrice);
 useEffect(()=>{
  let ws;
  const connect=()=>{
    ws=new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
    ws.onmessage=e=>{
      const d=JSON.parse(e.data);
      setPrice(parseFloat(d.p));
    };
    ws.onclose=()=>setTimeout(connect,2000);
  };
  connect();
 },[]);
}
