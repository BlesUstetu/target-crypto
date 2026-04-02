
import {useStore} from "../store";
import AlertPopup from "./AlertPopup";

export default function UI(){
 const {price,last,delta,smc,data,timeframe,setTF,alert}=useStore();
 const color=price>last?"#22c55e":price<last?"#ef4444":"#fff";

 return(
  <div className="min-h-screen bg-[#0b0f14] text-white p-4">
    <AlertPopup message={alert}/>

    <div className="flex justify-between mb-4">
      <h1 style={{color}}>BTC {price?price.toLocaleString():"..."}</h1>
      <select value={timeframe} onChange={e=>setTF(e.target.value)}>
        <option>1m</option><option>5m</option><option>15m</option>
      </select>
    </div>

    {delta && <p>BUY {delta.buy}% / SELL {delta.sell}%</p>}
    {smc && <p>Sweep: {smc.sweep||"-"}</p>}

    {data && (
      <div>
        <h2>{data.final}</h2>
        <p>{(data.confidence*100).toFixed(0)}%</p>
        <p>Entry {data.entry}</p>
        <p>TP {data.tp}</p>
        <p>SL {data.sl}</p>
      </div>
    )}
  </div>
 );
}
