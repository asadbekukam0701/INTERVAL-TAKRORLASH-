const {U,H,id}=require('./_db');
module.exports=async(req,res)=>{
  if(req.method==='GET')return res.json({k:process.env.VAPID_PUBLIC});
  const key=req.headers['x-sync-key'];
  if(!key||key.length<20)return res.status(401).end();
  const r=await fetch(`${U}/rest/v1/states?id=eq.${id(key)}`,{method:'PATCH',headers:H,body:JSON.stringify({sub:req.body})});
  res.status(r.ok?200:500).json({ok:r.ok});
};