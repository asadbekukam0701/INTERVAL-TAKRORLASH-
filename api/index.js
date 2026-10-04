const c=require('crypto');
const U=process.env.SUPABASE_URL,K=process.env.SUPABASE_SERVICE_KEY;
const H={apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'};
const P={
  cards:d=>`Sen oʻrganish kartalari yaratuvchisan. Quyidagi mavzu yoki matndan ${Math.min(30,Math.max(3,+d.n||10))} ta aniq, bitta faktli karta tuz. Faqat JSON massiv qaytar: [{"q":"savol","a":"qisqa javob","m":"juda qisqa eslab qolish maslahati"}]. Til: matn qaysi tilda boʻlsa, shu tilda; agar chet tili soʻzlari boʻlsa, q — soʻz, a — oʻzbekcha tarjima. Gap ichida yashirish mos boʻlsa, q ga {{yashirin soʻz}} shaklida yoz va a ni boʻsh qoldir.\nMatn:\n${String(d.text||'').slice(0,6000)}`,
  explain:d=>`Karta: savol "${String(d.q).slice(0,500)}", javob "${String(d.a).slice(0,500)}". Oʻzbek tilida 2 gapda tushuntir va bitta qisqa eslab qolish usuli (mnemonika) ber. Faqat matn, formatlashsiz.`,
  report:d=>`Quyidagi oʻrganish statistikasiga qarab oʻzbek tilida qisqa (5-6 gap) haftalik hisobot yoz: nima yaxshi, nimani yaxshilash kerak, keyingi hafta uchun 2 ta aniq maslahat. Ma'lumot: ${JSON.stringify(d.data).slice(0,2000)}`
};
module.exports=async(req,res)=>{
  const key=req.headers['x-sync-key'],a=req.query.a;
  if(!key||key.length<20)return res.status(401).json({e:'Sinxronlash kaliti kerak'});
  const id=c.createHash('sha256').update(String(key)).digest('hex');
  try{
    if(a==='sync'&&req.method==='GET'){
      const j=await(await fetch(`${U}/rest/v1/states?id=eq.${id}&select=data`,{headers:H})).json();
      return res.json((j[0]&&j[0].data)||null);
    }
    if(a==='sync'&&req.method==='POST'){
      const r=await fetch(`${U}/rest/v1/states?on_conflict=id`,{method:'POST',headers:{...H,Prefer:'resolution=merge-duplicates'},body:JSON.stringify({id,data:req.body,updated_at:new Date().toISOString()})});
      return res.status(r.ok?200:500).json({ok:r.ok});
    }
    if(a==='ai'&&req.method==='POST'){
      const chk=await(await fetch(`${U}/rest/v1/states?id=eq.${id}&select=id`,{headers:H})).json();
      if(!chk[0])return res.status(401).json({e:'Kalit topilmadi. Avval sinxronlang.'});
      const m=req.body&&req.body.mode;if(!P[m])return res.status(400).json({e:'mode'});
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL||'gemini-3.6-flash'}:generateContent`,{
        method:'POST',headers:{'x-goog-api-key':process.env.GEMINI_API_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({contents:[{role:'user',parts:[{text:P[m](req.body)}]}],generationConfig:m==='cards'?{responseMimeType:'application/json'}:{}})});
      const j=await r.json();
      if(!r.ok)return res.status(502).json({e:(j.error&&j.error.message)||'AI xatosi'});
      const t=((j.candidates&&j.candidates[0]&&j.candidates[0].content.parts)||[]).map(p=>p.text||'').join('');
      return res.json({t});
    }
    res.status(404).json({e:'yoʻl topilmadi'});
  }catch(e){res.status(500).json({e:String(e.message||e)})}
};
