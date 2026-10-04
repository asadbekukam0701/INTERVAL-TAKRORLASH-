function review(v){
  const q=queue();cur=q[0];
  const dn=S.log.filter(l=>l.t>=startDay()).length;v.appendChild($('div',{className:'prog'},'<i style="width:'+Math.round(100*dn/Math.max(1,dn+q.length))+'%"></i>'));
  const tags=[...new Set(S.cards.map(c=>c.tag).filter(Boolean))];
  if(tags.length)v.appendChild($('select',{style:'width:100%;padding:8px;margin-bottom:8px;border-radius:10px;border:1px solid var(--bd);background:var(--card);color:var(--fg)',onchange:e=>{S.filter=e.target.value;save();render()}},'<option value="">Barcha mavzular</option>'+tags.map(t=>`<option ${S.filter===t?'selected':''}>${esc(t)}</option>`).join('')));
  if(!cur){v.appendChild($('div',{className:'c'},'<div class="q" style="min-height:190px;flex-direction:column;gap:10px">'+(S.cards.length?'Bugungi ish tugadi<span class="sub">Keyingi takrorlash: '+nextDue()+'</span>':'Birinchi kartangizni qoʻshing<span class="sub">Kartalar boʻlimidan boshlang</span>')+'</div>'));return}
  v.appendChild($('div',{className:'hint',style:'margin-bottom:6px;text-align:center'},`Qolgan: ${q.length} · ${cur.s?'takror':'yangi'}`));
  const c=$('div',{className:'c'});
  if(cur.img)c.appendChild($('img',{src:cur.img,style:'display:block;max-width:100%;max-height:200px;margin:0 auto 8px;border-radius:8px'}));
  const qd=$('div',{className:'q'});qd.innerHTML=esc(cur.q).replace(/\{\{(.+?)\}\}/g,(m,t)=>'<span style="color:var(--gold)">'+(shown?t:'[…]')+'</span>');c.appendChild(qd);
  c.appendChild($('button',{style:'border:0;background:none;font-size:20px',onclick:()=>sp(shown?cur.a:cur.q)},'🔊'));
  if(shown){
    if(typed){const ok=norm(typed)===norm(cur.a);c.appendChild($('div',{className:'hint',style:'text-align:center;color:var(--'+(ok?'g':'r')+')'},(ok?'✓ Toʻgʻri: ':'✗ Siz yozdingiz: ')+esc(typed)))}
    const a=$('div',{className:'a'});a.textContent=cur.a;c.appendChild(a);
    if(cur.m)c.appendChild($('div',{className:'sub',style:'text-align:center;margin-top:14px'},'💡 '+esc(cur.m)));
    else c.appendChild($('button',{style:'display:block;margin:14px auto 0;border:0;background:none;color:var(--gold);font:600 13px var(--sans)',onclick:async e=>{e.target.textContent='...';try{const r=await askAI('explain',{q:cur.q,a:cur.a});cur.m=r.t.trim();cur.mod=Date.now();save();render()}catch(x){alert(x.message);e.target.textContent='✨ AI tushuntirish'}}},'✨ AI tushuntirish'));
  }
  v.appendChild(c);
  if(!shown){
    const go=()=>{typed=inp?inp.value.trim():'';shown=true;render()};
    var inp=S.typed?$('input',{placeholder:'Javobni yozing...',onkeydown:e=>{if(e.key==='Enter')go()}}):null;
    if(inp)v.appendChild(inp);
    if(inp&&SR)v.appendChild($('button',{style:'border:0;background:none;color:var(--gold);font:600 13px var(--sans);margin-bottom:8px',onclick:()=>{const r=new SR();r.lang=S.lang;r.onresult=e=>{inp.value=e.results[0][0].transcript;go()};r.start()}},'🎤 Ovoz bilan javob'));
    v.appendChild($('button',{className:'btn',onclick:go},S.typed?'Tekshirish':'Javobni koʻrsatish'));
  }else{
    const gr=$('div',{className:'grades'}),now=Date.now();
    [['Xato',1],['Qiyin',2],['Yaxshi',3],['Oson',4]].forEach(([n,g])=>gr.appendChild($('button',{onclick:()=>grade(g)},`${n}<small>${fmt(sched(cur,g,now).ms)}</small>`)));
    v.appendChild(gr);
  }
}