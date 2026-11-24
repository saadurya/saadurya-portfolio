// Motion v2: words rise, cards swing, counters, timelines, progress bar. No library; transform, opacity and clip-path only.
(()=>{
const de=document.documentElement;
if(matchMedia('(prefers-reduced-motion:reduce)').matches||!('IntersectionObserver' in window))return;
de.classList.add('js-motion');
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const HEAD='h1,h2,.about-statement,.ab-take',CARD='.project,.stat,.cred',
  REVEAL='.eyebrow,.ab-label,.cred-label,.sp-label,.project,.stat,.cred,.ab,.contact-card,.wid-row';

// shared reveal: add .in (animates), then .done (plain styles again) so nothing is left in a motion state
const settle=el=>setTimeout(()=>{el.classList.add('done');el.classList.remove('in');el.style.removeProperty('--d');el.style.removeProperty('--rz')},1800);
const show=(el,d,i)=>{
  if(el.classList.contains('in')||el.classList.contains('done'))return;
  el.style.setProperty('--d',d+'ms');
  if(el.matches(CARD))el.style.setProperty('--rz',(i%2?-1.5:1.5)+'deg');
  el.classList.add('in');settle(el)};
const io=new IntersectionObserver(es=>{
  es.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left)
    .forEach((e,i)=>{show(e.target,Math.min(i,5)*80,i);io.unobserve(e.target)});
},{threshold:.05,rootMargin:'0px 0px -6% 0px'});
const targets=[];
const watch=el=>{targets.push(el);io.observe(el)};
$$(REVEAL).forEach(watch);

// a) headlines: split into words (after fonts are ready), words rise from behind a mask
const split=n=>{[...n.childNodes].forEach(c=>{
  if(c.nodeType===3){
    const f=document.createDocumentFragment();
    c.textContent.split(/(\s+)/).forEach(p=>{
      if(!p)return;if(/^\s+$/.test(p)){f.append(p);return}
      const w=document.createElement('span'),i=document.createElement('span');
      w.className='w';w.setAttribute('aria-hidden','true');i.className='wi';i.textContent=p;i.style.setProperty('--i',Math.min(count++,24));
      w.append(i);f.append(w)});
    c.replaceWith(f)}
  else if(c.nodeType===1&&!c.classList.contains('w'))split(c)})};
let count=0;
const heads=$$(HEAD).filter(h=>!h.classList.contains('sr-only')&&!h.closest('.sr-only'));
const doSplit=()=>heads.forEach(h=>{
  if(h.classList.contains('split'))return;
  const text=h.textContent.trim().replace(/\s+/g,' ');count=0;split(h);
  if(/^H\d$/.test(h.tagName))h.setAttribute('aria-label',text);
  else{const s=document.createElement('span');s.className='sr-only';s.textContent=text;h.prepend(s)}
  h.classList.add('split');watch(h)});
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(doSplit);
setTimeout(doSplit,1500);

// safety: anything at or above the viewport is shown after 2s and on every scroll tick
const rescue=()=>targets.forEach(t=>{if(t.offsetParent&&t.getBoundingClientRect().top<innerHeight)show(t,0,0)});
setTimeout(rescue,2000);

// counters: count up once from 0; the final value stays in the HTML
const ease=t=>1-Math.pow(1-t,3);
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;co.unobserve(e.target);
  const el=e.target;el.style.minWidth=el.getBoundingClientRect().width+'px';
  const n=+el.dataset.count,orig=el.textContent,tpl=orig.replace(String(n),'{n}'),D=1000;
  const li=el.closest('.path li'),due=li?+li.style.getPropertyValue('--i')*380+300:0,wait=li&&path&&path._t?Math.max(0,path._t+due-performance.now()):due;
  const step=t0=>t=>{const p=Math.min(1,(t-t0)/D);el.textContent=p<1?tpl.replace('{n}',Math.round(n*ease(p))):orig;if(p<1)requestAnimationFrame(step(t0))};
  el.textContent=tpl.replace('{n}',0);
  setTimeout(()=>requestAnimationFrame(t=>requestAnimationFrame(step(t))),wait);
}),{threshold:.6});

// home timeline: items enter in order; the last one gets its sweep text
const path=document.querySelector('.path');
if(path){$$('li',path).forEach((li,i)=>{li.style.setProperty('--i',i);const b=li.querySelector('b');if(b)b.dataset.t=b.textContent});}
$$('[data-count]').forEach(el=>co.observe(el));
const once=(el,cls,ms,after)=>{if(!el)return;let o;const fire=()=>{if(el._t)return;el._t=performance.now();el.classList.add(cls);if(after)setTimeout(()=>el.classList.add('done'),after);o.disconnect()};o=new IntersectionObserver(es=>{if(es[0].isIntersecting)fire()},{threshold:.2});o.observe(el);setTimeout(fire,ms)};
once(path,'in',2000,4600);
// about timeline: line draws left to right, nodes pop in order
const tl=document.querySelector('.timeline');
if(tl){$$('.tl-item',tl).forEach((it,i)=>it.style.setProperty('--i',i));once(tl,'in',2000)}

// reading progress bar
const bar=document.createElement('div');bar.className='progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
let tick=false;
const upd=()=>{tick=false;const h=de.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';rescue()};
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});
addEventListener('resize',upd);upd();

// c) hover on fine pointers: cards lift 6px and tilt up to 3deg toward the cursor
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  let cur=null,raf=0,ev=null;
  const release=()=>{if(cur){cur.classList.remove('tilt');cur.style.removeProperty('--rx');cur.style.removeProperty('--ry');cur=null}};
  const apply=()=>{raf=0;if(!cur||!ev)return;const r=cur.getBoundingClientRect();
    cur.style.setProperty('--ry',((ev.clientX-r.left)/r.width-.5)*6+'deg');
    cur.style.setProperty('--rx',(.5-(ev.clientY-r.top)/r.height)*6+'deg')};
  document.addEventListener('pointermove',e=>{
    const c=e.target.closest&&e.target.closest(CARD);
    if(c!==cur){release();if(c&&c.classList.contains('done')){cur=c;c.classList.add('tilt')}}
    ev=e;if(cur&&!raf)raf=requestAnimationFrame(apply)},{passive:true});
  document.addEventListener('pointerleave',release);
  addEventListener('blur',release);
}
})();
