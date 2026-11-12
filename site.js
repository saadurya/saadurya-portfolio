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
        if(t.closest('#panel-lead')){showPanel('panel-lead');t.scrollIntoView({behavior:'instant'});return}
    if(t.classList.contains('project')){showPanel('panel-all');tag='all';open=true;render();t.scrollIntoView({behavior:'instant'})}};
  render();reveal();addEventListener('hashchange',reveal)}

// about: the experience line fills as you scroll through the timeline
const tl=document.querySelector('.timeline');
if(tl){
  const update=()=>{const r=tl.getBoundingClientRect();
    tl.style.setProperty('--p',Math.max(0,Math.min(1,(innerHeight*.6-r.top)/r.height)))};
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update()}

// about: "On this page" index follows the right column
const pageIndex=document.querySelector('.about-index');
if(pageIndex){
  const links=[...pageIndex.querySelectorAll('a')],blocks=links.map(a=>document.getElementById(a.hash.slice(1)));
  const mark=i=>links.forEach((a,j)=>j===i?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current'));
  const inBand=new Set();mark(0);
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{const i=blocks.indexOf(e.target);e.isIntersecting?inBand.add(i):inBand.delete(i)});
    if(inBand.size)mark(Math.max(...inBand))},{rootMargin:'-30% 0px -60% 0px'});
  blocks.forEach(b=>io.observe(b));
  links.forEach((a,i)=>a.addEventListener('click',()=>mark(i)))}

// about: skills tabs (without JavaScript every panel stays visible)
const skills=document.querySelector('.skills-tabs');
if(skills){
  const panels=[...skills.querySelectorAll('.spanel')];
  const list=document.createElement('div');list.className='stabs';list.setAttribute('role','tablist');list.setAttribute('aria-label','Skills and tools');
  panels.forEach(p=>{const b=document.createElement('button'),n=document.createElement('span');
    b.type='button';b.setAttribute('role','tab');b.id='st-'+p.id;b.setAttribute('aria-controls',p.id);
    n.className='n';n.textContent=p.querySelectorAll('.chips li').length;
    b.append(p.querySelector('h3').textContent,n);
    p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',b.id);list.append(b)});
  skills.classList.add('js-tabs');skills.prepend(list);
  const st=[...list.children];
  const pick=(i,focus)=>st.forEach((t,j)=>{const on=i===j;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;panels[j].hidden=!on;if(on&&focus)t.focus()});
  st.forEach((t,i)=>t.addEventListener('click',()=>pick(i)));
  list.addEventListener('keydown',e=>{
    const i=st.findIndex(t=>t.getAttribute('aria-selected')==='true');
    const to={ArrowRight:(i+1)%st.length,ArrowLeft:(i+st.length-1)%st.length,Home:0,End:st.length-1}[e.key];
    if(to===undefined)return;pick(to,true);e.preventDefault()});
  pick(0)}
