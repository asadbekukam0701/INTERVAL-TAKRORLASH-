const wp=require('web-push');const {U,H}=require('./_db');
module.exports=async(req,res)=>{
  if(req.headers.authorization!=='Bearer '+process.env.CRON_SECRET)return res.status(401).end();
  wp.setVapidDetails('mailto:'+process.env.VAPID_EMAIL,process.env.VAPID_PUBLIC,process.env.VAPID_PRIVATE);
  const rows=await(await fetch(`${U}/rest/v1/states?sub=not.is.null&select=id,data,sub`,{headers:H})).json();
  const now=Date.now();let sent=0;
  for(const r of rows){
    const cs=(r.data&&r.data.cards)||[];
    const due=cs.filter(c=>c.s&&c.due<=now).length,nw=Math.min(cs.filter(c=>!c.s).length,(r.data&&r.data.newLim)||20);
    if(!due&&!nw)continue;
    try{await wp.sendNotification(r.sub,JSON.stringify({title:'Takrorlash vaqti 🧠',body:`${due} ta takror, ${nw} ta yangi karta kutmoqda`}));sent++}
    catch(e){if(e.statusCode===404||e.statusCode===410)await fetch(`${U}/rest/v1/states?id=eq.${r.id}`,{method:'PATCH',headers:H,body:JSON.stringify({sub:null})})}
  }
  res.json({sent});
};