document.addEventListener('keydown',e=>{if(tab!=='r'||/INPUT|TEXTAREA/.test(e.target.tagName)||!cur)return;
  if(e.code==='Space'&&!shown){e.preventDefault();shown=true;render()}else if(shown&&'1234'.includes(e.key))grade(+e.key)});
if(S.theme)document.documentElement.dataset.theme=S.theme;
document.getElementById('th').onclick=()=>{const t=document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');S.theme=t==='dark'?'light':'dark';document.documentElement.dataset.theme=S.theme;save()};
(function(){try{const hh=location.hash;if(hh.startsWith('#d=')){const d=JSON.parse(decodeURIComponent(escape(atob(hh.slice(3)))));if(confirm(d.length+' ta karta import qilinsinmi?')){d.forEach(x=>S.cards.push({id:Date.now()+Math.random(),q:x[0],a:x[1],tag:x[2]||'',mod:Date.now()}));save()}history.replaceState(null,'',location.pathname)}
const t=new URLSearchParams(location.search).get('text');if(t){tab='k';window._pre=t}}catch(e){}})();
render();if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js');sync();document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});