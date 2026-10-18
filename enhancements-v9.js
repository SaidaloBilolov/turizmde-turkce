/* V9 targeted updates: full admin navigation, reporting, requested videos and typography. */
(function(){
  const videos = [
    'https://youtu.be/I8VCSmQYldo?si=B3I0cGYqaHamj-eS',
    'https://youtu.be/E-60t4rDRCI?si=GVhNiNtS7mN2uJv2',
    'https://youtu.be/7F2owFjE5f8?si=ecR2E8u4nHKT79gw',
    'https://youtu.be/Njp-60H9mO8?si=RxGqX9Ck1ahJRBdI',
    'https://youtu.be/qpnfVLBf6Ms?si=XwLRZenmHJnQl8VI',
    'https://youtu.be/JwVISWwtoPY?si=JfkhVUngB0IqXTtU',
    'https://youtu.be/Cp7U9km8O7U?si=d7-QssKIcqokI9gJ',
    'https://youtu.be/g1lPEYbr2WA?si=epkW3woXLJn_2D1C',
    'https://youtu.be/PyyX9D9BCZM?si=nQ_pmf81hQ0IKdnE',
    'https://youtu.be/gYsBX-jrnl8?si=oPtwaIiC4lDNtK81',
    'https://youtu.be/xuphB-zbmPk?si=Leou1t52Qef9h2OK',
    'https://youtu.be/LG7RVJ1_Tbc?si=tVVixsKBqcxlAktk',
    'https://youtu.be/GcSwHGAIHYA?si=9qs7ZKyG7shckzPa',
    'https://youtu.be/5Q63NFNjfeg?si=7wfsjhQUri23rGyJ',
    'https://youtu.be/POkXp4RJylc?si=ql9BbDTsNrbjjDls'
  ];
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const adminMode = () => typeof user !== 'undefined' && String(user||'').startsWith('admin:');
  // Expose the admin check globally: enhancements.js uses it while rendering challenge/lesson screens.
  window.adminMode = adminMode;
  window.available = function(d){ return adminMode() || d===1 || finished(d-1); };
  const localUserData = id => { try { return JSON.parse(localStorage.getItem('tt_user_'+id)||sessionStorage.getItem('tt_user_'+id)||'{}'); } catch(e) { return {}; } };
  const localAccounts = () => {
    let a=[];
    try { const saved=JSON.parse(localStorage.getItem('tt_accounts_override')||'null'); if(Array.isArray(saved)) a=saved; } catch(e){}
    if(!a.length) a=(window.DEMO_ACCOUNTS||[]).map(x=>Array.isArray(x)?({id:x[0],pw:x[1]}):x);
    const ids=new Set(a.map(x=>String(x.id)));
    try { for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('tt_user_')){const id=k.slice(8);if(!id.startsWith('admin:')&&!ids.has(id)){a.push({id,pw:''});ids.add(id)}}} } catch(e){}
    return a;
  };

  // Give administrators the same navigation to every existing panel, plus their control center.
  window.shell = function(body){
    const isAdmin=adminMode();
    const userNav=isAdmin
      ? [['admin','Admin panel'],['home','Bosh sahifa'],['challenge','15 kunlik challenge'],['results','Natijalar'],['books','Qo‘llanmalar'],['profile','Admin profili'],['guide','Yo‘riqnoma'],['about','Platforma haqida'],['help','Yordam va aloqa']]
      : [['home','Bosh sahifa'],['challenge','15 kunlik challenge'],['results','Mening natijalarim'],['books','Qo‘llanmalar'],['profile','Profil'],['help','Yordam'],['guide','Yo‘riqnoma'],['about','Platforma haqida'],['help','Aloqa']];
    document.querySelector('#app').innerHTML=`<div class="layout"><aside class="side"><img src="assets/images/logo 2- 100x300.png" alt="TURİZMDE TÜRKÇE">${userNav.map(([v,t])=>`<button class="${view===v?'active':''}" onclick="go('${v}')">${t}</button>`).join('')}<button onclick="logout()">Chiqish ↗</button></aside><main class="main">${body}</main></div>`;
  };

  // Explicitly bind navigation to the enhanced renderer so challenge navigation remains functional.
  window.go = function(v){ view=v; window.render(); window.scrollTo(0,0); };

  // Keep all current screens available to admin users, not just the admin route.
  window.render = function(){
    if(!user && !['landing','login','about','contact'].includes(view)) view='landing';
    switch(view){
      case 'landing': (window.landing || landing)(); break;
      case 'login': login(); break;
      case 'about': about(); break;
      case 'contact': contact(); break;
      case 'profile': profile(); break;
      case 'guide': guide(); break;
      case 'home': home(); break;
      case 'challenge': challenge(); break;
      case 'lesson': lesson(); break;
      case 'results': results(); break;
      case 'books': books(); break;
      case 'help': help(); break;
      case 'certificate': certificate(); break;
      case 'admin': admin(); break;
      default: if(adminMode()) admin(); else (window.landing || landing)();
    }
  };

  // Admins can inspect any day and step without changing a learner's access rules.
  window.openDay = function(d){ if(!adminMode() && !available(d)) return; day=d; step=adminMode()?0:([0,1,2,3].find(s=>!done(d,s))??0); go('lesson'); };
  window.lessonStep = function(s){ if(!adminMode() && s>0 && !done(day,s-1)) return; step=s; go('lesson'); };

  // Admin-only one-click completion: skip all four stages without audio.
  window.adminSkipDay = function(d){
    if(!adminMode()){ alert('Bu funksiya faqat administrator uchun.'); return; }
    d=Number(d); if(!Number.isInteger(d)||d<1||d>15) return;
    if(!confirm(`${d}-kunning barcha 4 bosqichi audiosiz yakunlangan deb belgilansinmi?`)) return;
    for(let s=0;s<4;s++) setDone(d,s);
    day=d; go('challenge');
  };

  // Replace all 15 old video URLs with the exact URLs supplied by the user.
  window.showVideo = function(n){
    const slot=document.querySelector('#video-slot');
    if(!slot) return;
    const url=videos[n-1];
    const id=url?.match(/youtu\.be\/([\w-]+)/)?.[1];
    slot.innerHTML=id?`<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${n}-kun video" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe></div><p><a href="${esc(url)}" target="_blank" rel="noopener">YouTube orqali ochish ↗</a></p>`:'Video havolasi topilmadi.';
  };

  // In the admin Results panel, show each local account and its progress, with direct editing access.
  const learnerResults = window.results;
  window.results = function(){
    if(!adminMode()){ if(typeof learnerResults==='function') return learnerResults(); return; }
    const rows=localAccounts().map(a=>{const id=String(a.id),d=localUserData(id),p=d.profile||{},doneMap=d.done||{};const steps=Object.values(doneMap).filter(Boolean).length;const days=Array.from({length:15},(_,i)=>[0,1,2,3].every(s=>!!doneMap[`${i+1}-${s}`])).filter(Boolean).length;return {id,p,steps,days,level:p.level||'—',name:[p.first,p.last].filter(Boolean).join(' ')||'Profil to‘ldirilmagan'};});
    const total=rows.reduce((s,r)=>s+r.steps,0),complete=rows.filter(r=>r.days===15).length;
    shell(`<section class="admin-hero"><div><span class="eyebrow">UMUMIY HISOBOT</span><h1>Foydalanuvchilar natijalari</h1><p>Mahalliy brauzerda saqlangan akkauntlar, bajarilgan bosqichlar va sertifikat holati.</p></div><div class="admin-stat"><b>${rows.length}</b><span>Akkauntlar</span></div><div class="admin-stat"><b>${complete}</b><span>15 kunni tugatgan</span></div><div class="admin-stat"><b>${total}</b><span>Bajarilgan bosqich</span></div></section><div class="admin-toolbar"><div><h2>Natijalar jadvali</h2><p class="muted">Foydalanuvchini boshqarish tugmasi orqali profil, login/parol va natijalarni tahrirlang.</p></div><input id="admin-results-search" placeholder="🔎 Login yoki ism bo‘yicha qidirish" oninput="filterAdminResults()"></div><div class="admin-results-list" id="admin-results-list">${rows.map(r=>`<article class="admin-user-card admin-result-row" data-search="${esc((r.id+' '+r.name+' '+r.level).toLowerCase())}"><div class="admin-user-avatar">${esc((r.name==='Profil to‘ldirilmagan'?r.id:r.name).slice(0,1).toUpperCase())}</div><div class="admin-user-main"><div class="admin-user-heading"><b>${esc(r.name)}</b><span class="pill">${r.days}/15 kun</span><span class="pill">${r.steps}/60 bosqich</span></div><p>Login: <strong>${esc(r.id)}</strong> · Daraja: ${esc(r.level)} · Email: ${esc(r.p.email||'—')}</p><div class="admin-progress"><span style="width:${Math.round(r.steps/60*100)}%"></span></div></div><div class="admin-user-actions"><button class="btn-primary" onclick="showUser('${esc(r.id)}')">Profil va natijalar →</button></div></article>`).join('')||'<p class="notice">Hozircha foydalanuvchilar topilmadi.</p>'}</div><div class="admin-panel-card" style="margin-top:18px"><h2>📚 O‘quv materiallari</h2><p>Elektron kutubxona va har bir kunning Word qo‘llanmalari darsning grammatika bo‘limidan ochiladi.</p><div class="actions"><button class="btn-primary" onclick="go('books')">Elektron kutubxonani ochish →</button><button class="btn-soft" onclick="go('challenge')">15 kunlik darslarni ko‘rish →</button><button class="btn-soft" onclick="go('guide')">Yo‘riqnoma →</button></div></div>`);
  };
  window.filterAdminResults=function(){const q=(document.querySelector('#admin-results-search')?.value||'').toLowerCase();document.querySelectorAll('.admin-result-row').forEach(el=>el.hidden=!el.dataset.search.includes(q));};

  // Admin profile: personal details and changeable admin login/password.
  const standardProfile = window.profile;
  window.profile = function(){
    if(!adminMode()){ if(typeof standardProfile==='function') return standardProfile(); return; }
    const d=localUserData(String(user)), p=d.profile||{};
    const admins=(()=>{try{const saved=JSON.parse(localStorage.getItem('tt_admins_override')||'null');if(Array.isArray(saved))return saved;}catch(e){}return (window.DEMO_ADMINS||[]).map(a=>({id:a[0],pw:a[1]}));})();
    const currentId=String(user).slice(6), current=admins.find(a=>String(Array.isArray(a)?a[0]:a.id)===currentId)||{id:currentId,pw:''};
    const currentPw=Array.isArray(current)?current[1]:current.pw;
    shell(`<section class="admin-hero"><div><span class="eyebrow">ADMIN SOZLAMALARI</span><h1>Admin profili</h1><p>Shaxsiy ma’lumotlaringiz va admin akkauntiga kirish ma’lumotlarini boshqaring.</p></div><div class="admin-stat"><b>✓</b><span>Administrator</span></div></section><div class="admin-edit-grid"><section class="admin-panel-card"><h2>👤 Shaxsiy ma’lumotlar</h2><form id="admin-self-profile"><label>Ism</label><input name="first" value="${esc(p.first||'')}" required><label>Familiya</label><input name="last" value="${esc(p.last||'')}" required><label>Yosh</label><input name="age" type="number" min="1" max="120" value="${esc(p.age||'')}" required><label>Email</label><input name="email" type="email" value="${esc(p.email||'')}"><label>Turk tili darajasi</label><select name="level">${['A1','A2','B1','B2','C1','C2'].map(l=>`<option ${p.level===l?'selected':''}>${l}</option>`).join('')}</select><button class="btn-primary">Profilni saqlash</button></form></section><section class="admin-panel-card"><h2>🔐 Admin login va parol</h2><form id="admin-self-credentials"><label>Yangi login</label><input name="login" value="${esc(currentId)}" required><label>Yangi parol</label><div class="password-wrap"><input id="admin-self-password" name="password" type="password" value="${esc(currentPw||'')}" required><button type="button" class="password-toggle ghost" onclick="const p=document.querySelector('#admin-self-password');p.type=p.type==='password'?'text':'password'">◉</button></div><button class="btn-primary">Login va parolni saqlash</button><p class="small muted">O‘zgartirgandan keyin joriy admin sessiyasi yangi login bilan davom etadi.</p></form></section></div><section class="admin-panel-card"><h2>🧭 Barcha panellar</h2><p>Admin paneldan foydalanuvchilar, natijalar, darslar, qo‘llanmalar va yo‘riqnomaga kirishingiz mumkin.</p><div class="actions"><button class="btn-primary" onclick="go('admin')">Foydalanuvchilarni boshqarish</button><button class="btn-soft" onclick="go('results')">Natijalar</button><button class="btn-soft" onclick="go('books')">Qo‘llanmalar</button><button class="btn-soft" onclick="go('challenge')">Darslar</button></div></section>`);
    document.querySelector('#admin-self-profile').onsubmit=e=>{e.preventDefault();const data=localUserData('admin:'+currentId);data.profile=Object.fromEntries(new FormData(e.target));try{localStorage.setItem('tt_user_admin:'+currentId,JSON.stringify(data));alert('Admin profili saqlandi.');}catch(err){alert('Profilni saqlab bo‘lmadi: brauzer xotirasini tekshiring.')}};
    document.querySelector('#admin-self-credentials').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),newId=String(f.get('login')).trim(),newPw=String(f.get('password'));if(!newId||!newPw)return;const all=admins.map(a=>Array.isArray(a)?{id:a[0],pw:a[1]}:{id:a.id,pw:a.pw});if(all.some(a=>String(a.id)===newId&&String(a.id)!==currentId)){alert('Bu admin logini band. Boshqa login kiriting.');return}const idx=all.findIndex(a=>String(a.id)===currentId);if(idx<0)all.push({id:newId,pw:newPw});else all[idx]={id:newId,pw:newPw};try{localStorage.setItem('tt_admins_override',JSON.stringify(all));if(newId!==currentId){const oldKey='tt_user_admin:'+currentId,newKey='tt_user_admin:'+newId;const oldData=localStorage.getItem(oldKey)||sessionStorage.getItem(oldKey);if(oldData)localStorage.setItem(newKey,oldData);localStorage.removeItem(oldKey);sessionStorage.removeItem(oldKey);}user='admin:'+newId;localStorage.setItem('tt_session',user);sessionStorage.setItem('tt_session',user);alert('Admin login va parol yangilandi.');go('profile');}catch(err){alert('Kirish ma’lumotlarini saqlab bo‘lmadi.');}};
  };

  // The updated login also honours saved admin credentials after they have been changed.
  window.login = function(){
    document.querySelector('#app').innerHTML=`<div class="auth card auth-premium"><img src="assets/images/logo 2- 100x300.png" style="width:180px"><span class="eyebrow">HOŞ GELDİNİZ</span><h2>Platformaga kirish</h2><p class="muted">Davom etish uchun login va parolingizni kiriting.</p><form id="loginform"><label>Login</label><input name="id" required autocomplete="username" placeholder="Login raqamingiz"><label>Parol</label><div class="password-wrap"><input id="login-password" name="pw" type="password" required autocomplete="current-password" placeholder="Parolingiz"><button type="button" class="password-toggle ghost" aria-label="Parolni ko‘rsatish" onclick="togglePassword()">◉</button></div><p id="error" class="login-error"></p><button class="btn-primary login-submit">Kirishga davom etish →</button><button type="button" class="btn-soft login-back" onclick="go('landing')">← Bosh sahifa</button></form><p class="small muted">Foydalanuvchi natijalari ushbu qurilmaning brauzerida saqlanadi.</p></div>`;
    document.querySelector('#loginform').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),id=String(f.get('id')).trim(),pw=String(f.get('pw'));let admins=[];try{admins=JSON.parse(localStorage.getItem('tt_admins_override')||'null')||[];}catch(err){}if(!admins.length)admins=(window.DEMO_ADMINS||[]).map(a=>({id:a[0],pw:a[1]}));const found=admins.find(a=>String(Array.isArray(a)?a[0]:a.id)===id&&String(Array.isArray(a)?a[1]:a.pw)===pw);if(found){user='admin:'+id;try{sessionStorage.setItem('tt_session',user);localStorage.setItem('tt_session',user);}catch(err){}go('admin');return;}const acc=localAccounts().find(a=>String(a.id)===id&&String(a.pw)===pw);if(!acc){document.querySelector('#error').textContent='Login yoki parol noto‘g‘ri. Qayta tekshirib ko‘ring.';return;}user=id;try{sessionStorage.setItem('tt_session',id);localStorage.setItem('tt_session',id);}catch(err){document.querySelector('#error').textContent='Sessiyani saqlab bo‘lmadi. Brauzer xotirasini tekshiring.';return;}go(localUserData(id).profile?'home':'profile');};
  };

  // Trigger the new navigation immediately after all overrides have been installed.
  try { if(typeof render==='function') render(); } catch(e) { console.error('V9 render error',e); }
})();
