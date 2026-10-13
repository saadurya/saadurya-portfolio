// theme toggle: remembers the choice, falls back to the system setting
const root=document.documentElement,btn=document.querySelector('.theme-btn');
try{const t=localStorage.getItem('theme');if(t)root.dataset.theme=t}catch(e){}
const isDark=()=>root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
const paint=()=>{if(btn){btn.textContent=isDark()?'☀':'☾';btn.setAttribute('aria-label',isDark()?'Switch to light theme':'Switch to dark theme')}};
paint();
btn&&btn.addEventListener('click',()=>{const n=isDark()?'light':'dark';root.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(e){}paint()});

// work filters
const bar=document.querySelector('.filters');
if(bar){bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  bar.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  const tag=b.dataset.tag;let n=0;
  document.querySelectorAll('.project').forEach(p=>{const show=tag==='all'||p.dataset.tags.split(' ').includes(tag);p.hidden=!show;if(show)n++});
  document.getElementById('count').textContent=n+(n===1?' project':' projects')})}
