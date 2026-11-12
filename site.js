// theme toggle: remembers the choice, falls back to the system setting
const root=document.documentElement,btn=document.querySelector('.theme-btn');
try{const t=localStorage.getItem('theme');if(t)root.dataset.theme=t}catch(e){}
const isDark=()=>root.dataset.theme==='dark';
const paint=()=>{if(btn){btn.textContent=isDark()?'☀':'☾';btn.setAttribute('aria-label',isDark()?'Switch to light theme':'Switch to dark theme')}};
paint();
btn&&btn.addEventListener('click',()=>{const n=isDark()?'light':'dark';root.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(e){}paint()});

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
  // arriving via #id: show everything so the target is never hidden
  const reveal=()=>{const t=location.hash&&document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if(t&&t.classList.contains('project')){tag='all';open=true;render();t.scrollIntoView({behavior:'instant'})}};
  render();reveal();addEventListener('hashchange',reveal)}
