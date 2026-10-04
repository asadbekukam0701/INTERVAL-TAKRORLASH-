const c=require('crypto');
const U=process.env.SUPABASE_URL,K=process.env.SUPABASE_SERVICE_KEY;
const H={apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'};
const id=k=>c.createHash('sha256').update(String(k)).digest('hex');
module.exports={U,H,id};