// FSRS-5 (Free Spaced Repetition Scheduler) — Anki ishlatadigan zamonaviy algoritm
const W=[0.4072,1.1829,3.1262,15.4722,7.2102,0.5316,1.0651,0.0234,1.616,0.1544,1.0824,1.9813,0.0953,0.2975,2.2042,0.2407,2.9466,0.5034,0.6567];
const F=19/81,DC=-0.5,DAY=864e5;
const cl=(x,a,b)=>Math.min(b,Math.max(a,x));
const Rt=(t,s)=>Math.pow(1+F*t/s,DC);
const Iv=(s,r)=>s/F*(Math.pow(r,1/DC)-1);
const D0=g=>cl(W[4]-Math.exp(W[5]*(g-1))+1,1,10);
const ICON={r:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="11" rx="3"/><path d="M8 20h8"/></svg>',k:'<svg viewBox="0 0 24 24"><rect x="3.5" y="7" width="13" height="13" rx="3"/><path d="M8 4h10a2.5 2.5 0 0 1 2.500 2.500V16"/></svg>',s:'<svg viewBox="0 0 24 24"><path d="M5 20v-9M12 20V5M19 20v-6"/></svg>'};
function nextDue(){const n=Date.now(),d=S.cards.filter(c=>c.s&&c.due>n).map(c=>c.due);return d.length?fmt(Math.min(...d)-n)+' ichida':'hali rejalashtirilmagan'}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
async function askAI(mode,d){
  if(!S.key)throw new Error('Avval Statistika → Sozlamalarda sinxronlash kalitini yarating');
  const r=await fetch('/api/ai',{method:'POST',headers:{'x-sync-key':S.key,'Content-Type':'application/json'},body:JSON.stringify(Object.assign({mode},d))});
  const j=await r.json();if(!r.ok)throw new Error(j.e||'AI xatosi');return j;
}
let S={cards:[],ret:0.9,newLim:20,log:[],mult:1,lang:'en-US',typed:false,filter:''},tab='r',cur=null,shown=false;
try{const x=localStorage.getItem('itk');if(x)S=Object.assign(S,JSON.parse(x))}catch(e){}
let st=null,busy=false;
const save=()=>{S.upd=Date.now();try{localStorage.setItem('itk',JSON.stringify(S))}catch(e){};clearTimeout(st);st=setTimeout(sync,3000)};
function merge(a,b){
  const m=new Map();[...a.cards,...(b.cards||[])].forEach(c=>{const o=m.get(c.id);if(!o||(c.mod||0)>(o.mod||0))m.set(c.id,c)});
  const dd=new Map();[...(a.dead||[]),...(b.dead||[])].forEach(d=>{const o=dd.get(d.id);if(!o||d.mod>o.mod)dd.set(d.id,d)});
  dd.forEach((d,id)=>{const c=m.get(id);if(c&&(c.mod||0)<=d.mod)m.delete(id)});
  const lg=new Map();[...a.log,...(b.log||[])].forEach(l=>lg.set(l.t+'_'+l.g,l));
  const nw=(b.upd||0)>(a.upd||0)?b:a;
  return Object.assign({},nw,{cards:[...m.values()],dead:[...dd.values()],log:[...lg.values()].sort((x,y)=>x.t-y.t).slice(-5000),key:a.key,upd:Math.max(a.upd||0,b.upd||0)});
}
function sync(){
  if(!S.key||busy)return;busy=true;const k=S.key;
  fetch('/api/sync',{headers:{'x-sync-key':k}}).then(r=>r.ok?r.json():null).then(rem=>{
    S=merge(S,rem||{cards:[],log:[]});S.key=k;
    try{localStorage.setItem('itk',JSON.stringify(S))}catch(e){}
    return fetch('/api/sync',{method:'POST',headers:{'x-sync-key':k,'Content-Type':'application/json'},body:JSON.stringify(Object.assign({},S,{key:undefined}))});
  }).catch(()=>{}).finally(()=>{busy=false;if(!shown&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))render()});
}
async function pushOn(){
  try{
    if(!S.key){alert('Avval sinxronlash kalitini yarating');return}
    const p=await Notification.requestPermission();if(p!=='granted'){alert('Ruxsat berilmadi');return}
    const reg=await navigator.serviceWorker.ready,k=(await(await fetch('/api/push')).json()).k;
    const b=k.replace(/-/g,'+').replace(/_/g,'/'),ar=Uint8Array.from(atob(b+'='.repeat((4-b.length%4)%4)),c=>c.charCodeAt(0));
    const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:ar});
    await fetch('/api/sync',{method:'POST',headers:{'x-sync-key':S.key,'Content-Type':'application/json'},body:JSON.stringify(Object.assign({},S,{key:undefined}))});
    await fetch('/api/push',{method:'POST',headers:{'x-sync-key':S.key,'Content-Type':'application/json'},body:JSON.stringify(sub)});
    alert('Eslatma yoqildi ✓');
  }catch(e){alert('Xato: '+e.message)}
}
function sched(c,g,now){
  let s,d;
  if(!c.s){s=W[g-1];d=D0(g)}
  else{
    const r=Rt(Math.max(0,(now-c.last)/DAY),c.s);
    d=c.d-W[6]*(g-3)*(10-c.d)/9;d=cl(W[7]*D0(4)+(1-W[7])*d,1,10);
    if(g===1)s=Math.min(c.s,W[11]*Math.pow(d,-W[12])*(Math.pow(c.s+1,W[13])-1)*Math.exp((1-r)*W[14]));
    else s=c.s*(1+Math.exp(W[8])*(11-d)*Math.pow(c.s,-W[9])*(Math.exp((1-r)*W[10])-1)*(g===2?W[15]:1)*(g===4?W[16]:1));
  }
  s=cl(s,0.01,36500);
  const days=Math.max(1,Math.round(Iv(s,S.ret)*S.mult));
  return{s,d,last:now,due:g===1?now+6e5:now+days*DAY,ms:g===1?6e5:days*DAY};
}
function fmt(ms){const m=ms/6e4;if(m<60)return Math.round(m)+' daq';const d=ms/DAY;if(d<30)return Math.round(d)+' kun';if(d<365)return Math.round(d/30.4)+' oy';return (d/365).toFixed(1)+' yil'}
const startDay=()=>{const d=new Date();d.setHours(0,0,0,0);return+d};
function queue(){
  const now=Date.now(),pool=S.cards.filter(c=>!S.filter||c.tag===S.filter),due=pool.filter(c=>c.s&&c.due<=now).sort((a,b)=>S.mix?((a.id*7919)%1009)-((b.id*7919)%1009):a.due-b.due);
  const used=S.log.filter(l=>l.t>=startDay()&&l.nw).length;
  const nw=pool.filter(c=>!c.s).slice(0,Math.max(0,S.newLim-used));
  return due.concat(nw);
}
function grade(g){
  const c=cur,now=Date.now(),nw=!c.s;
  S.log.push({t:now,g,nw,rv:!nw,p:nw?0:+Rt(Math.max(0,(now-c.last)/DAY),c.s).toFixed(4)});if(S.log.length>5000)S.log.shift();
  const r=sched(c,g,now);Object.assign(c,r);c.mod=now;delete c.ms;c.reps=(c.reps||0)+1;if(g===1&&!nw)c.lapses=(c.lapses||0)+1;
  save();shown=false;typed='';render();
}