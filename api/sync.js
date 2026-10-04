const {U,H,id}=require('./_db');
module.exports=async(req,res)=>{
  const key=req.headers['x-sync-key'];
  if(!key||key.length<20)return res.status(401).json({e:'key'});
  const i=id(key);
  if(req.method==='GET'){
    const r=await fetch(`${U}/rest/v1/states?id=eq.${i}&select=data`,{headers:H});
    const j=await r.json();return res.json((j[0]&&j[0].data)||null);
  }
  if(req.method==='POST'){
    const r=await fetch(`${U}/rest/v1/states?on_conflict=id`,{method:'POST',headers:{...H,Prefer:'resolution=merge-duplicates'},body:JSON.stringify({id:i,data:req.body,updated_at:new Date().toISOString()})});
    return res.status(r.ok?200:500).json({ok:r.ok});
  }
  res.status(405).end();
};
