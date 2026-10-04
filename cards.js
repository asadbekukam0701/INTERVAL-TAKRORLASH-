function cards(v){
  const a=$('div',{className:'c'},'<h2>Yangi karta</h2>');
  const q=$('input',{placeholder:'Savol yoki cloze: Poytaxt — {{Toshkent}}'}),an=$('input',{placeholder:'Javob'}),tg=$('input',{placeholder:'Mavzu (ixtiyoriy)'});
  const im=$('input',{type:'file',accept:'image/*',onchange:e=>{const f=e.target.files[0];if(!f)return;const i=new Image();i.onload=()=>{const k=Math.min(1,360/Math.max(i.width,i.height)),cv=document.createElement('canvas');cv.width=i.width*k;cv.height=i.height*k;cv.getContext('2d').drawImage(i,0,0,cv.width,cv.height);nimg=cv.toDataURL('image/jpeg',.7)};i.src=URL.createObjectURL(f)}});
  const rv=$('label',{className:'hint',style:'display:block;margin-bottom:8px'},'<input type="checkbox" style="width:auto;margin-right:6px"'+(nrev?' checked':'')+'> Teskari karta ham yaratilsin');
  rv.firstChild.onchange=e=>{nrev=e.target.checked};
  const mk=(x,y,i,m)=>{const t=tg.value.trim(),id=Date.now()+Math.random(),cz=/\{\{.+?\}\}/.test(x);if(cz&&!y)y=[...x.matchAll(/\{\{(.+?)\}\}/g)].map(z=>z[1]).join(', ');S.cards.push({id,q:x,a:y,tag:t,img:i||'',m:m||'',mod:Date.now()});if(nrev&&!cz)S.cards.push({id:id+.5,q:y,a:x,tag:t,mod:Date.now()})};
  const add=$('button',{className:'btn',onclick:()=>{const x=q.value.trim(),y=an.value.trim();if(!x||(!y&&!/\{\{.+?\}\}/.test(x)))return;mk(x,y,nimg);nimg='';save();render()}});add.textContent='Qoʻshish';
  if(window._pre){q.value=window._pre;window._pre=''}
  a.append(q,an,tg,$('div',{className:'hint'},'Rasm (ixtiyoriy):'),im,rv,add);v.appendChild(a);
  const aiB=$('div',{className:'c'},'<h2>✨ AI bilan karta yaratish (Gemini)</h2>');
  const at=$('textarea',{placeholder:'Mavzu yoki matn: "Fotosintez" yoki oʻqiganingizni qoʻying'}),nn=$('input',{type:'number',value:10,min:3,max:30});
  const ab=$('button',{className:'btn',onclick:async()=>{if(!at.value.trim())return;ab.textContent='Yaratilmoqda...';try{const r=await askAI('cards',{text:at.value,n:+nn.value});const arr=JSON.parse(r.t.replace(/```json|```/g,''));arr.forEach(c=>mk(c.q,c.a||'','',c.m));save();render()}catch(e){alert('AI xatosi: '+e.message);ab.textContent='Kartalarni yaratish'}}});
  ab.textContent='Kartalarni yaratish';aiB.append(at,$('div',{className:'hint'},'Kartalar soni:'),nn,ab);v.appendChild(aiB);
  const b=$('div',{className:'c'},'<h2>Koʻpchilik qoʻshish</h2><div class="hint" style="margin-bottom:6px">Har qatorda: savol | javob (yuqoridagi mavzu va teskari sozlamasi qoʻllanadi)</div>');
  const t=$('textarea',{placeholder:'apple | olma\nbook | kitob'});
  const ib=$('button',{className:'btn',onclick:()=>{t.value.split('\n').forEach(l=>{const p=l.split('|');if(p.length>=2&&p[0].trim()&&p[1].trim())mk(p[0].trim(),p.slice(1).join('|').trim())});save();render()}});ib.textContent='Hammasini qoʻshish';
  b.append(t,ib);v.appendChild(b);
  const l=$('div',{className:'c'},`<h2>Barcha kartalar (${S.cards.length}) · tahrirlash uchun bosing</h2>`);
  S.cards.slice(-50).reverse().forEach(c=>{const r=$('div',{className:'row'}),s=$('span',{onclick:()=>{const x=prompt('Savol',c.q);if(x===null)return;const y=prompt('Javob',c.a);if(y===null)return;c.q=x;c.a=y;c.mod=Date.now();save();render()}});s.textContent=(c.img?'🖼 ':'')+(c.tag?'['+c.tag+'] ':'')+c.q+' — '+c.a;const x=$('button',{onclick:()=>{S.cards=S.cards.filter(k=>k!==c);(S.dead=S.dead||[]).push({id:c.id,mod:Date.now()});save();render()}});x.textContent='✕';r.append(s,x);l.appendChild(r)});
  v.appendChild(l);
}