// Motion: reveal on scroll, counters, timeline, progress bar, page wipe. No library; transform and opacity only.
(()=>{
const de=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const REVEAL='.wid-card,.stat,.hire-box,.project,.cred,.ab,.contact-card';
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

// page wipe: clear on back/forward restore so a page is never left covered
addEventListener('pageshow',e=>{if(e.persisted)de.classList.remove('wipe-out')});
setTimeout(()=>de.classList.remove('wipe-in'),700);

if(reduce||!('IntersectionObserver' in window))return;
de.classList.add('js-motion');

// 4) reveal on scroll: once, small batches, 80ms stagger; shown anyway if in view after 2s
const settle=el=>setTimeout(()=>{el.classList.add('done');el.classList.remove('in');el.style.removeProperty('--d')},1100);
const show=(el,d)=>{if(el.classList.contains('in')||el.classList.contains('done'))return;el.style.setProperty('--d',d+'ms');el.classList.add('in');settle(el)};
const targets=$$(REVEAL);
const io=new IntersectionObserver(es=>{
  es.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left)
    .forEach((e,i)=>{show(e.target,Math.min(i,5)*80);io.unobserve(e.target)});
},{threshold:.05,rootMargin:'0px 0px -6% 0px'});
targets.forEach(t=>io.observe(t));
const rescue=()=>targets.forEach(t=>{if(t.offsetParent&&t.getBoundingClientRect().top<innerHeight)show(t,0)});
setTimeout(rescue,2000);

// 2) counters: count up once; the final value stays in the HTML
const ease=t=>1-Math.pow(1-t,3);
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;co.unobserve(e.target);
  const el=e.target;el.style.minWidth=el.getBoundingClientRect().width+'px';const n=+el.dataset.count,orig=el.textContent,tpl=orig.replace(String(n),'{n}'),t0=performance.now(),D=1000;
  const step=t=>{const p=Math.min(1,(t-t0)/D);el.textContent=p<1?tpl.replace('{n}',Math.round(n*ease(p))):orig;if(p<1)requestAnimationFrame(step)};
  el.textContent=tpl.replace('{n}',0);requestAnimationFrame(step);
}),{threshold:.6});
$$('[data-count]').forEach(el=>co.observe(el));

// 3) timeline: the line draws and the dots light in order once it is in view
const path=document.querySelector('.path');
if(path){const po=new IntersectionObserver(es=>{if(es[0].isIntersecting){path.classList.add('in');po.disconnect()}},{threshold:.2});po.observe(path);setTimeout(()=>path.classList.add('in'),2000)}

// 5) reading progress bar
const bar=document.createElement('div');bar.className='progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
let tick=false;
const upd=()=>{tick=false;const h=de.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';rescue()};
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});
addEventListener('resize',upd);upd();

// 6) page wipe between internal .html pages; navigates after 450ms at the latest
document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  if((a.target&&a.target!=='_self')||a.hasAttribute('download'))return;
  const u=new URL(a.href,location.href);
  if(u.origin!==location.origin||!/(\.html|\/)$/.test(u.pathname)||u.pathname===location.pathname)return;
  e.preventDefault();
  try{sessionStorage.setItem('wipe','1')}catch(_){}
  de.classList.add('wipe-out');
  setTimeout(()=>{location.href=u.href},450);
});
})();
