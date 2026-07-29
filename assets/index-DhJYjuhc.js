(function(){const c=document.createElement("link").relList;if(c&&c.supports&&c.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))m(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&m(i)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function m(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();const M=[{id:"hunt",label:"hunt",color:"#ff4d6d",x:.62,y:.58,count:42},{id:"java",label:"java",color:"#4ea8ff",x:.78,y:.28,count:28},{id:"ops",label:"ops",color:"#57d39a",x:.28,y:.32,count:24},{id:"links",label:"links",color:"#ffb020",x:.22,y:.68,count:14},{id:"notes",label:"notes",color:"#d56cff",x:.48,y:.26,count:18},{id:"logs",label:"logs",color:"#9aa0a6",x:.46,y:.72,count:12}];function K(t,c){const n=t.getContext("2d");if(!n)return{dispose:()=>{},open:()=>{},setAccent:()=>{}};const m=window.matchMedia("(prefers-reduced-motion: reduce)").matches,s=()=>Math.min(window.devicePixelRatio||1,2);let o=1,i=1,u="#ff4d6d",f=0,x=!0,r=0,h=null,d=!1,g=0,I=0,B=0,P=0,T=!1;const R=[];for(const e of M)for(let l=0;l<e.count;l++){const y=l/e.count*Math.PI*2,v=.035+Math.random()*(.04+e.count*.0018),p=Math.cos(y)*v*(.7+Math.random()*.6),a=Math.sin(y)*v*(.7+Math.random()*.6);R.push({cluster:e.id,x:e.x+p,y:e.y+a,ox:p,oy:a,phase:Math.random()*Math.PI*2})}const X=[{label:"now",x:.12,y:.18,color:"#f2efe8"},{label:"gap",x:.88,y:.74,color:u}],S=()=>{const e=t.getBoundingClientRect();o=Math.max(1,e.width),i=Math.max(1,e.height);const l=s();t.width=Math.floor(o*l),t.height=Math.floor(i*l),n.setTransform(l,0,0,l,0,0)},$=(e,l)=>{const y=(e-g)/o,v=(l-I)/i;let p=null,a=.09;for(const b of M){const w=Math.hypot(y-b.x,v-b.y),U=.055+b.count*.001;w<U&&w<a&&(p=b.id,a=w)}return p},H=()=>{if(x){r+=.016,n.clearRect(0,0,o,i),n.save(),n.translate(g,I);for(const e of M){const l=m?0:Math.sin(r*1.2+e.x*8)*.004,y=e.x*o,v=e.y*i,p=h===e.id;n.globalAlpha=p?.28:.14,n.strokeStyle=e.color,n.lineWidth=1;for(const a of R){if(a.cluster!==e.id)continue;const b=(e.x+a.ox+(m?0:Math.sin(r*.8+a.phase)*.004+l))*o,w=(e.y+a.oy+(m?0:Math.cos(r*.7+a.phase)*.004))*i;n.beginPath(),n.moveTo(y,v),n.lineTo(b,w),n.stroke()}n.globalAlpha=1;for(const a of R){if(a.cluster!==e.id)continue;const b=(e.x+a.ox+(m?0:Math.sin(r*.8+a.phase)*.004+l))*o,w=(e.y+a.oy+(m?0:Math.cos(r*.7+a.phase)*.004))*i;n.beginPath(),n.fillStyle=e.color,n.arc(b,w,p?2.4:1.8,0,Math.PI*2),n.fill()}n.fillStyle=p?"#f2efe8":e.color,n.font=`500 ${p?14:12}px "JetBrains Mono", monospace`,n.textAlign="center",n.fillText(e.label,y,v+4)}for(const e of X){const l=e.label==="gap"?u:e.color;n.beginPath(),n.fillStyle=l,n.arc(e.x*o,e.y*i,3,0,Math.PI*2),n.fill(),n.fillStyle="#8b877f",n.font='400 11px "JetBrains Mono", monospace',n.textAlign="left",n.fillText(e.label,e.x*o+8,e.y*i+4)}n.restore(),f=requestAnimationFrame(H)}},F=e=>{const l=t.getBoundingClientRect(),y=e.clientX-l.left,v=e.clientY-l.top;if(d){const p=e.clientX-B,a=e.clientY-P;Math.hypot(p,a)>3&&(T=!0),g+=p,I+=a,B=e.clientX,P=e.clientY;return}h=$(y,v),t.style.cursor=h?"pointer":d?"grabbing":"grab"},j=e=>{d=!0,T=!1,B=e.clientX,P=e.clientY,t.setPointerCapture(e.pointerId)},L=e=>{const l=t.getBoundingClientRect(),y=e.clientX-l.left,v=e.clientY-l.top;if(!T){const p=$(y,v);p&&c(p)}d=!1;try{t.releasePointerCapture(e.pointerId)}catch{}},q=()=>{document.hidden?cancelAnimationFrame(f):x&&(f=requestAnimationFrame(H))};return window.addEventListener("resize",S),t.addEventListener("pointermove",F),t.addEventListener("pointerdown",j),t.addEventListener("pointerup",L),t.addEventListener("pointercancel",L),document.addEventListener("visibilitychange",q),S(),f=requestAnimationFrame(H),{dispose:()=>{x=!1,cancelAnimationFrame(f),window.removeEventListener("resize",S),t.removeEventListener("pointermove",F),t.removeEventListener("pointerdown",j),t.removeEventListener("pointerup",L),t.removeEventListener("pointercancel",L),document.removeEventListener("visibilitychange",q)},open:e=>c(e),setAccent:e=>{u=e}}}M.map(t=>t.id);const z={hunt:{tag:"hunt",html:`
      <h2>Hunt</h2>
      <p class="lead">Ищу щель в чужом периметре. Не теорию. PoC.</p>
      <p>
        Внешний контур: web, API, identity fabric. IDOR, SSRF, ATO, auth bypass.
        Сначала карта продукта и коллизии интересов. Потом гипотеза. Потом доказательство.
      </p>
      <p>
        Если нельзя воспроизвести, это ещё не баг. Если можно, пишу отчёт RU и EN,
        без театра и без воды.
      </p>
      <ul>
        <li>recon без шума ради шума</li>
        <li>evidence gate перед статусом finding</li>
        <li>платформы: BI.ZONE, Standoff, H1, Bugcrowd</li>
      </ul>
    `},java:{tag:"java",html:`
      <h2>Java</h2>
      <p class="lead">Основной язык. Mid. Spring. Жёсткая логика.</p>
      <p>
        JVM, concurrency, REST, тесты. Пишу бэкенд так, чтобы его можно было атаковать
        честно и чинить быстро. Магии не люблю. Явные контракты люблю.
      </p>
      <p>
        Рядом по нужде: Python для скриптов, C# / .NET по задаче, Linux, Git.
        Но если выбирать один стержень, это Java.
      </p>
    `},ops:{tag:"ops",html:`
      <h2>Ops</h2>
      <p class="lead">Как я работаю, когда открываю цель.</p>
      <ul>
        <li>снять поверхность и понять продукт как систему ролей</li>
        <li>найти места, где trust boundary врёт</li>
        <li>собрать минимальный PoC</li>
        <li>упаковать impact так, чтобы бизнес понял риск</li>
      </ul>
      <p>
        Странно и дерзко тут не поза. Это режим: не останавливаться на красивой гипотезе.
        Дожимать до факта.
      </p>
    `},links:{tag:"links",html:`
      <h2>Links</h2>
      <p class="lead">Быстрый контакт и код.</p>
      <div class="links">
        <a href="https://t.me/RusCreat" target="_blank" rel="noopener noreferrer">telegram/@RusCreat</a>
        <a href="https://github.com/yurchik228336" target="_blank" rel="noopener noreferrer">github/yurchik228336</a>
        <a href="https://discordapp.com/users/RusCreat" target="_blank" rel="noopener noreferrer">discord/RusCreat</a>
      </div>
      <p>Если дело короткое, пиши в Telegram. Если код, смотри GitHub.</p>
    `},notes:{tag:"notes",html:`
      <h2>Notes</h2>
      <p class="lead">Это визитка, которая ведёт себя как карта.</p>
      <p>
        Не лендинг с тремя карточками скиллов. Кластеры: темы, которые реально крутятся
        вокруг меня. Hunt, Java, Ops, Links. Остальное шум.
      </p>
      <p>
        Сайт можно таскать мышкой. Кластер можно открыть. В sh можно жить, если хочется
        терминального режима.
      </p>
    `},logs:{tag:"logs",html:`
      <h2>Logs</h2>
      <p class="lead">Короткий статус.</p>
      <p>Сейчас: Java mid. Охота на периметре. Свободен для задач и странных коллабов.</p>
      <p>© <span data-year></span> RusCreat</p>
      <p>пасхалки: logo x7 · ctrl+\` · konami · #root</p>
    `}},_=["cmds: help hunt java ops links notes logs map clear eggs","open a cluster by name, or click it on the map"];function G(){const t=document.getElementById("term"),c=document.getElementById("term-out"),n=document.getElementById("term-input"),m=document.getElementById("term-close"),s=document.getElementById("open-term"),o={open:()=>{},close:()=>{},toggle:()=>{},print:()=>{}};if(!t||!c||!n)return o;const i=(h,d="")=>{const g=document.createElement("div");d&&(g.className=d),g.textContent=h,c.appendChild(g),c.scrollTop=c.scrollHeight},u=()=>{t.hidden=!1,n.focus()},f=()=>{t.hidden=!0},x=()=>{t.hidden?u():f()},r=h=>{const d=h.trim().toLowerCase();if(d&&(i(`$ ${h}`,"muted"),!o.onCommand?.(d)))switch(d){case"help":case"?":_.forEach(g=>i(g,"muted"));break;case"whoami":i("RusCreat | java mid | perimeter hunter","ok");break;case"eggs":i("logo x7 · ctrl+` · konami · #root","muted");break;case"clear":c.innerHTML="",i("cleared","muted");break;case"exit":case"q":f();break;default:i(`not found: ${d}`,"muted")}};return n.addEventListener("keydown",h=>{if(h.key==="Enter"){const d=n.value;n.value="",r(d)}h.key==="Escape"&&f()}),m?.addEventListener("click",f),s?.addEventListener("click",u),i("map shell online. type help","muted"),o.open=u,o.close=f,o.toggle=x,o.print=i,o}const k=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];function V(t,c){const n=document.getElementById("brand"),m=document.getElementById("hint");let s=0,o=0,i=!1,u=[];const f=r=>{i=!i,document.body.classList.toggle("is-egg",i),c?.setAccent(i?"#39ff14":"#ff4d6d"),t.open(),t.print(i?`signal on via ${r}`:"signal off","ok"),m&&(m.textContent=i?"signal mode":"кластеры живые. потыкай.")};n?.addEventListener("click",r=>{r.stopPropagation(),s+=1,window.clearTimeout(o),o=window.setTimeout(()=>{s=0},1600),s>=7&&(s=0,f("logo x7"))}),window.addEventListener("keydown",r=>{if(r.target instanceof HTMLInputElement||r.target instanceof HTMLTextAreaElement)return;if((r.ctrlKey||r.metaKey)&&r.key==="`"){r.preventDefault(),t.toggle();return}const h=r.key.length===1?r.key.toLowerCase():r.key;u.push(h),u.length>k.length&&(u=u.slice(-k.length)),u.length===k.length&&u.every((d,g)=>d===k[g])&&(u=[],f("konami"))});const x=()=>{const r=location.hash.toLowerCase();(r==="#root"||r==="#jvm"||r==="#0day")&&(i||f(`hash ${r}`),history.replaceState(null,"",`${location.pathname}${location.search}`))};x(),window.addEventListener("hashchange",x),console.log("%cRusCreat%c · explore map · sh · logo x7","color:#ff4d6d;font-weight:700;font-family:monospace","color:#8b877f;font-family:monospace")}const E=document.getElementById("panel"),O=document.getElementById("panel-body"),Y=document.getElementById("panel-tag"),W=document.getElementById("panel-close"),A=document.getElementById("hint"),J=t=>{if(!E||!O||!Y)return;const c=z[t];Y.textContent=c.tag,O.innerHTML=c.html;const n=O.querySelector("[data-year]");n&&(n.textContent=String(new Date().getFullYear())),E.hidden=!1,requestAnimationFrame(()=>E.classList.add("is-open")),A&&(A.textContent=`open: ${t}`)},N=()=>{E&&(E.classList.remove("is-open"),window.setTimeout(()=>{E.classList.contains("is-open")||(E.hidden=!0)},700),A&&(A.textContent="кластеры живые. потыкай."))};W?.addEventListener("click",N);window.addEventListener("keydown",t=>{t.key==="Escape"&&N()});const D=document.getElementById("map"),Z=D instanceof HTMLCanvasElement?K(D,t=>J(t)):null,C=G();C.onCommand=t=>["hunt","java","ops","links","notes","logs"].includes(t)?(J(t),C.print(`opened ${t}`,"ok"),!0):t==="map"||t==="explore"?(N(),C.print("back to map","ok"),!0):!1;V(C,{setAccent:t=>Z?.setAccent(t)});
