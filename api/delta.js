
export default async function handler(req,res){
 async function f(url){try{const r=await fetch(url);return await r.json()}catch{return null}}
 const b=await f("https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=20");
 const by=await f("https://api.bybit.com/v5/market/orderbook?category=linear&symbol=BTCUSDT");
 const ok=await f("https://www.okx.com/api/v5/market/books?instId=BTC-USDT");
 const cb=await f("https://api.exchange.coinbase.com/products/BTC-USD/book?level=2");
 let buy=0,sell=0;
 if(b){b.bids.forEach(x=>buy+=+x[1]);b.asks.forEach(x=>sell+=+x[1]);}
 if(by?.result?.b){by.result.b.forEach(x=>buy+=+x[1]);by.result.a.forEach(x=>sell+=+x[1]);}
 if(ok?.data?.[0]){ok.data[0].bids.forEach(x=>buy+=+x[1]);ok.data[0].asks.forEach(x=>sell+=+x[1]);}
 if(cb){cb.bids.forEach(x=>buy+=+x[1]);cb.asks.forEach(x=>sell+=+x[1]);}
 const t=buy+sell||1;
 res.json({buy:Math.round(buy/t*100),sell:Math.round(sell/t*100)});
}
