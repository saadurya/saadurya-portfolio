// theme toggle: remembers the choice, falls back to the system setting
const root=document.documentElement,btn=document.querySelector('.theme-btn');
try{const t=localStorage.getItem('theme');if(t)root.dataset.theme=t}catch(e){}
const isDark=()=>root.dataset.theme==='dark';
const paint=()=>{if(btn){btn.textContent=isDark()?'☀':'☾';btn.setAttribute('aria-label',isDark()?'Switch to light theme':'Switch to dark theme')}};
paint();
btn&&btn.addEventListener('click',()=>{const n=isDark()?'light':'dark';root.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(e){}paint()});

// work page: two tabs (14 projects, 0 → 1)
const tabs=[...document.querySelectorAll('[role="tab"]')];
const showPanel=(id,focus)=>{tabs.forEach(t=>{const on=t.getAttribute('aria-controls')===id;
  t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!on;if(on&&focus)t.focus()})};
if(tabs.length){
  tabs.forEach(t=>t.addEventListener('click',()=>showPanel(t.getAttribute('aria-controls'))));
  document.querySelector('[role="tablist"]').addEventListener('keydown',e=>{
    if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
    const i=tabs.findIndex(t=>t.getAttribute('aria-selected')==='true');
    showPanel(tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length].getAttribute('aria-controls'),true);e.preventDefault()})}

// work filters: six cards by default, "Show all" reveals the rest
const bar=document.querySelector('.filters');
if(bar){
  const cards=[...document.querySelectorAll('.project')],more=document.getElementById('toggle'),count=document.getElementById('count');
  let tag='all',open=false;
  const render=()=>{let n=0;
    cards.forEach(p=>{const match=tag==='all'||p.dataset.tags.split(' ').includes(tag);
      const show=match&&(tag!=='all'||open||!p.classList.contains('extra'));p.hidden=!show;if(show)n++});
    bar.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tag===tag));
    count.textContent=n+(n===1?' project':' projects');
    if(more){more.parentElement.hidden=tag!=='all';more.setAttribute('aria-expanded',open);
      more.textContent=open?'Show fewer':'Show all '+cards.length+' projects'}};
  bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;tag=b.dataset.tag;render()});
  more&&more.addEventListener('click',()=>{open=!open;render()});
  // arriving via #lead opens the 0 → 1 tab; #id opens the projects tab with every card shown
  const reveal=()=>{const id=location.hash&&decodeURIComponent(location.hash.slice(1)),t=id&&document.getElementById(id);
    if(!t)return;
    if(id==='lead'){showPanel('panel-lead');t.scrollIntoView({behavior:'instant'});return}
    if(t.classList.contains('project')){showPanel('panel-all');tag='all';open=true;render();t.scrollIntoView({behavior:'instant'})}};
  render();reveal();addEventListener('hashchange',reveal)}

// about: experience counter and progress line
const exp=document.querySelector('.exp');
if(exp){
  const jobs=[...exp.querySelectorAll('.xjob')],cur=document.getElementById('exp-cur'),fill=exp.querySelector('.exp-bar i');
  const update=()=>{const line=innerHeight*.33;let n=1;
    jobs.forEach((j,i)=>{if(j.getBoundingClientRect().top<=line)n=i+1});
    cur.textContent=String(n).padStart(2,'0');
    const a=jobs[0].getBoundingClientRect().top,b=jobs[jobs.length-1].getBoundingClientRect().top;
    fill.style.width=Math.max(0,Math.min(1,(line-a)/(b-a)))*100+'%'};
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update()}
