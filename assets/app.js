(function(){
function track(name,props){try{if(window.posthog)posthog.capture(name,props||{});}catch(e){}}
function trackSection(section){try{if(window.posthog)posthog.capture('$pageview',{$current_url:location.origin+location.pathname+'#'+section,section:section});}catch(e){}}
function applyTheme(t){
  t=t||{};
  var r=document.documentElement.style;
  if(t.background_color) r.setProperty('--paper', t.background_color);
  if(t.text_color) r.setProperty('--ink', t.text_color);
  if(t.image_opacity!=null && t.image_opacity!==''){
    var v=Math.max(0,Math.min(1, 1 - Number(t.image_opacity)/100));
    if(!isNaN(v)) r.setProperty('--veil', String(v));
  }
  var fonts={
    'Helvetica':"'Helvetica Neue',Helvetica,Arial,sans-serif",
    'Space Grotesk':"'Space Grotesk',sans-serif",
    'Space Mono':"'Space Mono',monospace",
    'Georgia':"Georgia,'Times New Roman',serif"
  };
  if(t.font && fonts[t.font]){
    r.setProperty('--sans', fonts[t.font]);
    if(t.font.indexOf('Space')===0){
      var l=document.createElement('link'); l.rel='stylesheet';
      l.href='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono&display=swap';
      document.head.appendChild(l);
    }
  }
}

async function load(){
  const [settings,stills,motion,background]=await Promise.all([
    fetch('content/settings.json').then(r=>r.json()),
    fetch('content/stills.json').then(r=>r.json()),
    fetch('content/motion.json').then(r=>r.json()),
    fetch('content/background.json').then(r=>r.ok?r.json():{}).catch(function(){return {};})
  ]);
  applyTheme(settings.theme);
  // background slideshow — dedicated Background list (falls back to the first 8 stills if empty)
  const bg=document.querySelector('.bg');
  var bgImgs=(background&&background.images&&background.images.length)?background.images:(stills.images||[]).slice(0,8);
  bgImgs.forEach((src,i)=>{
    const d=document.createElement('div'); d.className='slide'+(i===0?' on':''); d.style.backgroundImage='url("'+encodeURI(src)+'")'; bg.appendChild(d);
  });
  // bio
  const txt=document.querySelector('#bio .txt'); txt.innerHTML='';
  (settings.bio||[]).forEach(p=>{const el=document.createElement('p'); el.textContent=p; txt.appendChild(el);});
  const port=document.querySelector('#bio .port');
  if(settings.portrait){port.innerHTML='<img src="'+settings.portrait+'" alt="C.J. Brion">';}
  // contact
  var mailLink=document.getElementById('mailLink'); if(mailLink){mailLink.textContent=settings.email; mailLink.href='mailto:'+settings.email; mailLink.addEventListener('click',function(){track('email_clicked',{via:'mailto'});});}
  var copyBtn=document.getElementById('copyMail'); if(copyBtn){copyBtn.setAttribute('data-email',settings.email);}
  // stills grid
  const brick=document.querySelector('#stills .brick'); brick.innerHTML='';
  (stills.images||[]).forEach(src=>{
    const f=document.createElement('figure'); const im=document.createElement('img'); im.loading='lazy'; im.src=src; f.appendChild(im);
    f.addEventListener('click',function(){
      var isOpen=this.classList.contains('open');
      brick.querySelectorAll('figure.open').forEach(function(x){x.classList.remove('open');});
      if(!isOpen){this.classList.add('open'); track('still_opened',{src:src}); var self=this; setTimeout(function(){self.scrollIntoView({behavior:'smooth',block:'nearest'});},60);}
    });
    brick.appendChild(f);
  });
  // motion
  const mo=document.getElementById('motion'); mo.innerHTML='';
  (motion.projects||[]).forEach(pr=>{
    const a=document.createElement('a'); a.className='vid'; a.href=pr.video_url||'#'; if(pr.video_url){a.target='_blank';a.rel='noopener';a.addEventListener('click',function(){track('reel_clicked',{title:pr.title||'',client:pr.client||'',role:pr.role||'',url:pr.video_url});});} else {a.onclick=function(){return false;};}
    const th=document.createElement('div'); th.className='vthumb'; if(pr.thumbnail){th.style.backgroundImage='url("'+encodeURI(pr.thumbnail)+'")';}
    th.innerHTML='<span class="play">▶</span><span class="vt">'+(pr.title||'')+'</span>';
    const mt=document.createElement('div'); mt.className='vmeta'; mt.innerHTML='<span>'+(pr.client||'')+'</span><span>'+(pr.role||'')+'</span>';
    a.appendChild(th); a.appendChild(mt); mo.appendChild(a);
  });
}

var stage,current=null;
const PANELS={motion:'motion',stills:'stills',bio:'bio'};
function clearNav(){document.querySelectorAll('.navitem').forEach(n=>n.classList.remove('active'));}
function hideAll(){Object.values(PANELS).forEach(id=>document.getElementById(id).classList.remove('on'));document.getElementById('mailtoWrap').classList.remove('on');}
window.goHome=function(){current=null;clearNav();stage.classList.remove('view');hideAll();trackSection('home');};
window.showView=function(name,el){
  if(current===name){goHome();return;}
  current=name;clearNav();if(el)el.classList.add('active');stage.classList.add('view');hideAll();
  var p=document.getElementById(PANELS[name]);void p.offsetWidth;p.classList.add('on');trackSection(name);
  if(window.innerWidth<=862){setTimeout(function(){p.scrollIntoView({behavior:'smooth',block:'start'});},60);}
};
window.showContact=function(el){if(current==='contact'){goHome();return;}current='contact';clearNav();el.classList.add('active');stage.classList.add('view');Object.values(PANELS).forEach(id=>document.getElementById(id).classList.remove('on'));document.getElementById('mailtoWrap').classList.add('on');trackSection('contact');track('contact_opened');};
window.openCV=function(){track('cv_opened');trackSection('cv');window.open('CJ_Brion_CV.pdf','_blank');};
window.copyEmail=function(btn){track('email_copied');
  var ml=document.getElementById('mailLink');
  var em=(btn&&btn.getAttribute('data-email'))||(ml?ml.textContent:'');
  var note=document.getElementById('copiedNote');
  function done(){ if(note){note.classList.add('show'); clearTimeout(note._t); note._t=setTimeout(function(){note.classList.remove('show');},1500);} }
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(em).then(done,done);}
  else{try{var t=document.createElement('textarea');t.value=em;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.focus();t.select();document.execCommand('copy');document.body.removeChild(t);}catch(e){}done();}
};

document.addEventListener('DOMContentLoaded',function(){
  stage=document.getElementById('stage');
  load().then(function(){
    var slides=[].slice.call(document.querySelectorAll('.slide'));var si=0;
    if(slides.length>1){setInterval(function(){slides[si].classList.remove('on');si=(si+1)%slides.length;slides[si].classList.add('on');},5200);}
  });
});
})();
