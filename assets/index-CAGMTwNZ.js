import{W as R,S as $,P as _,G as U,C as H,a as I,V as P,M as x,I as D,A as N,T as O,b as K,c as V,B as Y,F as Z,d as J}from"./three-DdqinRnp.js";(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))c(o);new MutationObserver(o=>{for(const e of o)if(e.type==="childList")for(const s of e.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&c(s)}).observe(document,{childList:!0,subtree:!0});function t(o){const e={};return o.integrity&&(e.integrity=o.integrity),o.referrerPolicy&&(e.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?e.credentials="include":o.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function c(o){if(o.ep)return;o.ep=!0;const e=t(o);fetch(o.href,e)}})();const T=13169986,X=16731438,j=`
uniform float uTime;
uniform vec2 uMouse;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vPulse;

// compact hash noise
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

void main() {
  vNormal = normalize(normalMatrix * normal);
  float n = noise(position * 1.35 + uTime * 0.35);
  float n2 = noise(position * 2.8 - uTime * 0.2);
  float displace = (n * 0.85 + n2 * 0.42) * (1.0 + length(uMouse) * 0.55);
  vec3 pos = position + normal * displace;
  vPulse = displace;
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,Q=`
uniform vec3 uColor;
uniform vec3 uInk;
uniform float uTime;
uniform vec2 uMouse;
uniform float uFade;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vPulse;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.6);
  float bands = sin((vWorld.y + vWorld.x * 0.4) * 9.0 - uTime * 2.2) * 0.5 + 0.5;
  bands = smoothstep(0.35, 0.85, bands);
  float core = smoothstep(0.05, 0.55, vPulse);
  vec3 col = mix(uInk * 0.35, uColor, core * 0.55 + bands * 0.35);
  col += uColor * fresnel * (1.15 + abs(uMouse.x) * 0.4);
  float alpha = (0.22 + fresnel * 0.75 + core * 0.2) * uFade;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
}
`;function ee(a){const i=new Float32Array(a*3);for(let c=0;c<a;c++){const o=2.2+Math.random()*3.4,e=Math.random()*Math.PI*2,s=Math.acos(2*Math.random()-1);i[c*3]=o*Math.sin(s)*Math.cos(e),i[c*3+1]=o*Math.sin(s)*Math.sin(e),i[c*3+2]=o*Math.cos(s)}const t=new Y;return t.setAttribute("position",new Z(i,3)),t}function te(a){const i=window.matchMedia("(prefers-reduced-motion: reduce)").matches,t=window.matchMedia("(max-width: 860px)").matches,c=new R({canvas:a,antialias:!t,alpha:!0,powerPreference:"high-performance"});c.setClearColor(0,0),c.setPixelRatio(Math.min(window.devicePixelRatio,t?1.35:1.85));const o=new $,e=new _(38,1,.1,100),s=t?7.4:6.2;e.position.set(t?0:1.1,.15,s);const r=new U;r.position.set(t?0:1.35,t?.9:.1,0),o.add(r);const d={uTime:{value:0},uMouse:{value:new P(0,0)},uColor:{value:new H(T)},uInk:{value:new H(657930)},uFade:{value:1}},f=new I({uniforms:d,vertexShader:j,fragmentShader:Q,transparent:!0,depthWrite:!1}),n=new x(new D(t?1.7:2.05,t?4:6),f);r.add(n);const u=new I({uniforms:d,vertexShader:j,fragmentShader:`
      uniform vec3 uColor;
      uniform float uFade;
      varying float vPulse;
      void main() {
        float a = (0.18 + vPulse * 0.65) * uFade;
        gl_FragColor = vec4(uColor, a);
      }
    `,transparent:!0,depthWrite:!1,wireframe:!0}),m=new x(new D(t?2.05:2.45,1),u);r.add(m);const v=new I({uniforms:d,vertexShader:`
      uniform float uTime;
      varying float vA;
      void main() {
        vA = 0.35 + 0.65 * abs(sin(position.x * 3.0 + uTime));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 uColor;
      uniform float uFade;
      varying float vA;
      void main() {
        gl_FragColor = vec4(uColor, vA * 0.55 * uFade);
      }
    `,transparent:!0,depthWrite:!1,blending:N}),y=new x(new O(2.9,.014,8,t?96:180),v);y.rotation.x=Math.PI/2.4,r.add(y);const g=new x(new O(3.35,.01,8,t?80:160),v);g.rotation.x=Math.PI/1.7,g.rotation.y=.6,r.add(g);const p=new K(ee(t?180:420),new V({color:T,size:t?.025:.03,transparent:!0,opacity:.75,depthWrite:!1,blending:N,sizeAttenuation:!0}));r.add(p);const h=new P(0,0),M=new P(0,0),S=new J;let k=1,w=0,E=!0;const B=l=>{M.x=l.clientX/window.innerWidth*2-1,M.y=l.clientY/window.innerHeight*2-1},L=()=>{k=Math.max(.2,1-window.scrollY/(window.innerHeight*.9))},A=()=>{const l=window.innerWidth,W=window.innerHeight;e.aspect=l/W,e.updateProjectionMatrix(),c.setSize(l,W,!1)},C=()=>{if(!E)return;const l=S.getElapsedTime();h.lerp(M,.045),d.uTime.value=l,d.uMouse.value.copy(h),i||(r.rotation.y=l*.18+h.x*.35,r.rotation.x=.25+h.y*.28,m.rotation.y=-l*.12,m.rotation.z=l*.08,y.rotation.z=l*.35,g.rotation.z=-l*.22,p.rotation.y=l*.05,n.scale.setScalar(1+Math.sin(l*1.4)*.03),d.uFade.value=k,p.material.opacity=.25+k*.5),e.position.x=(t?0:1.1)+h.x*.45,e.position.y=.15-h.y*.25,e.lookAt(r.position.x*.55,r.position.y*.4,0),c.render(o,e),w=requestAnimationFrame(C)},z=()=>{document.hidden?cancelAnimationFrame(w):E&&(S.start(),w=requestAnimationFrame(C))};return window.addEventListener("pointermove",B,{passive:!0}),window.addEventListener("resize",A),window.addEventListener("scroll",L,{passive:!0}),document.addEventListener("visibilitychange",z),A(),L(),w=requestAnimationFrame(C),{dispose:()=>{E=!1,cancelAnimationFrame(w),window.removeEventListener("pointermove",B),window.removeEventListener("resize",A),window.removeEventListener("scroll",L),document.removeEventListener("visibilitychange",z),n.geometry.dispose(),m.geometry.dispose(),y.geometry.dispose(),g.geometry.dispose(),p.geometry.dispose(),f.dispose(),u.dispose(),v.dispose(),p.material.dispose(),c.dispose()},setSignal:l=>{d.uColor.value.setHex(l),p.material.color.setHex(l)}}}function oe(a,i){document.body.classList.toggle("is-egg",a),i?.setSignal(a?X:T)}const ne=["cmds: help whoami stack hunt java idor clear sudo eggs","eggs: logo x7, ctrl+`, konami, #root"];function re(){const a=document.getElementById("term"),i=document.getElementById("term-out"),t=document.getElementById("term-input"),c=document.getElementById("term-close"),o=document.getElementById("open-term");if(!a||!i||!t)return{open:()=>{},close:()=>{},toggle:()=>{},print:()=>{}};const e=(n,u="")=>{const m=document.createElement("div");u&&(m.className=u),m.textContent=n,i.appendChild(m),i.scrollTop=i.scrollHeight},s=()=>{a.hidden=!1,t.focus()},r=()=>{a.hidden=!0},d=()=>{a.hidden?s():r()},f=n=>{const u=n.trim().toLowerCase();if(u)switch(e(`$ ${n}`,"muted"),u){case"help":case"?":ne.forEach(m=>e(m,"muted"));break;case"whoami":e("RusCreat | Java mid | external security","ok");break;case"stack":e("java=mid; spring; python=scripts; csharp=on-demand;");break;case"hunt":e("recon > product map > collision hyp > evidence > report"),e("BI.ZONE / Standoff / H1 / Bugcrowd","muted");break;case"java":e("System.out.println(still shipping);"),e("// mid, но упрямый","muted");break;case"sudo":e("already root on this desk","ok");break;case"konami":case"eggs":e("logo x7 · ctrl+` · konami · #root|#jvm|#0day","muted");break;case"idor":e("if (userId != session.userId) throw AccessDenied;"),e("// horizontal + vertical, не только UUID","muted");break;case"ssrf":e("fetch(userUrl) // нет. allowlist hosts.");break;case"clear":i.innerHTML="",e("cleared","muted");break;case"exit":case"q":r();break;default:e(`not found: ${u}`,"muted"),e("try help","muted")}};return t.addEventListener("keydown",n=>{if(n.key==="Enter"){const u=t.value;t.value="",f(u)}n.key==="Escape"&&r()}),c?.addEventListener("click",r),o?.addEventListener("click",s),e("ruscreat.dev shell. type help","muted"),{open:s,close:r,toggle:d,print:e}}const b=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];function ie(a,i){const t=document.getElementById("brand"),c=document.getElementById("hint");let o=0,e=0,s=!1,r=[];const d=n=>{s=!s,oe(s,i??void 0),a.open(),a.print(s?`signal on via ${n}`:"signal off","ok"),c&&(c.textContent=s?"signal mode · /bin/sh":"logo x7 · ctrl+` · /bin/sh")};t?.addEventListener("click",()=>{o+=1,window.clearTimeout(e),e=window.setTimeout(()=>{o=0},1600),o>=7&&(o=0,d("logo x7"))}),window.addEventListener("keydown",n=>{if(n.target instanceof HTMLInputElement||n.target instanceof HTMLTextAreaElement)return;if((n.ctrlKey||n.metaKey)&&n.key==="`"){n.preventDefault(),a.toggle();return}const u=n.key.length===1?n.key.toLowerCase():n.key;r.push(u),r.length>b.length&&(r=r.slice(-b.length)),r.length===b.length&&r.every((m,v)=>m===b[v])&&(r=[],d("konami"))});const f=()=>{const n=location.hash.toLowerCase();(n==="#root"||n==="#jvm"||n==="#0day")&&(s||d(`hash ${n}`),history.replaceState(null,"",`${location.pathname}${location.search}`))};f(),window.addEventListener("hashchange",f),console.log("%cRusCreat%c · /bin/sh · logo x7 · konami · #root","color:#c8f542;font-weight:700;font-family:monospace","color:#8f8a80;font-family:monospace")}const G=document.getElementById("year");G&&(G.textContent=String(new Date().getFullYear()));const q=document.getElementById("scene"),ae=q instanceof HTMLCanvasElement?te(q):null,se=re();ie(se,ae);const F=document.querySelectorAll(".slab");if(F.length&&"IntersectionObserver"in window){const a=new IntersectionObserver(i=>{for(const t of i)t.isIntersecting&&(t.target.classList.add("is-in"),a.unobserve(t.target))},{threshold:.14,rootMargin:"0px 0px -6% 0px"});F.forEach(i=>a.observe(i))}else F.forEach(a=>a.classList.add("is-in"));
