const $=(t,p={},h='')=>Object.assign(document.createElement(t),p,h?{innerHTML:h}:{});
function render(){
  const nav=document.getElementById('nav');nav.innerHTML='';
  [['r','Takrorlash'],['k','Kartalar'],['s','Statistika']].forEach(([k,n])=>{const b=$('button',{className:tab===k?'on':'',onclick:()=>{tab=k;shown=false;render()}});b.innerHTML=ICON[k]+'<span>'+n+'</span>';nav.appendChild(b)});
  const v=document.getElementById('v');v.innerHTML='';
  (tab==='r'?review:tab==='k'?cards:stats)(v);
}
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=x=>x.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
let typed='',nimg='',nrev=false;
function sp(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=S.lang;speechSynthesis.speak(u)}catch(e){}}
function calib(){
  const L=S.log.filter(l=>l.rv&&l.p&&l.t>(S.calAt||0));
  if(L.length<50){alert('Kamida 50 ta yangi takrorlash kerak (hozir: '+L.length+')');return}
  const p=cl(L.reduce((a,l)=>a+l.p,0)/L.length,.05,.99),r=cl(L.filter(l=>l.g>1).length/L.length,.05,.99);
  S.mult=cl(S.mult*Math.log(p)/Math.log(r),.5,2);S.calAt=Date.now();save();
  alert('Moslandi. Intervallar koeffitsiyenti: '+S.mult.toFixed(2)+' (kutilgan '+Math.round(p*100)+'%, haqiqiy '+Math.round(r*100)+'%)');render();
}