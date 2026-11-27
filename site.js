(function(){
  var root=document.documentElement;root.classList.remove('no-js');root.classList.add('js');
  requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('loaded')})});
  var nav=document.querySelector('.site-nav');
  addEventListener('scroll',function(){nav.classList.toggle('is-scrolled',scrollY>8)},{passive:true});

  /* ---- generic tabs (steppers and demo) ---- */
  function setupTabs(root, tabSel, onChange){

    var tabs=[].slice.call(root.querySelectorAll(tabSel));
    var panels=tabs.map(function(t){return document.getElementById(t.getAttribute('aria-controls'))});
    var prev=root.querySelector('[data-prev]'), next=root.querySelector('[data-next]');
    var cur=0;
    function show(i,focus){
      root.classList.toggle('back', i<cur);
      cur=i;
      tabs.forEach(function(t,j){
        var on=j===i;
        t.setAttribute('aria-selected',String(on));
        t.tabIndex=on?0:-1;
        panels[j].hidden=!on;
      });
      if(prev){prev.disabled=i===0}
      if(next){next.disabled=i===tabs.length-1}
      if(focus) tabs[i].focus();
      if(onChange) onChange(i);
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){show(i)});
      t.addEventListener('keydown',function(e){
        var k=e.key, n=tabs.length;
        if(k==='ArrowRight'||k==='ArrowDown'){e.preventDefault();show((i+1)%n,true)}
        else if(k==='ArrowLeft'||k==='ArrowUp'){e.preventDefault();show((i-1+n)%n,true)}
        else if(k==='Home'){e.preventDefault();show(0,true)}
        else if(k==='End'){e.preventDefault();show(n-1,true)}
      });
    });
    if(prev) prev.addEventListener('click',function(){if(cur>0)show(cur-1)});
    if(next) next.addEventListener('click',function(){if(cur<tabs.length-1)show(cur+1)});
    show(0);
  }
  [].forEach.call(document.querySelectorAll('[data-stepper]'),function(s){setupTabs(s,'[role=tab]')});
  [].forEach.call(document.querySelectorAll('[data-tabs]'),function(s){setupTabs(s,'[role=tab]')});

  /* ---- tier tool ---- */
  var form=document.getElementById('tier-form');
  if(form){
    var ladder=[].slice.call(document.querySelectorAll('.tier-ladder li'));
    var why=document.getElementById('tier-why');
    function tier(){
      var size=form.size.value, acc=form.acc.value, proj=form.proj.value, t, r;
      if(size==='large' && proj==='yes'){t='advanced';r='<b>Start at Advanced.</b> A large company with joint delivery on Advantech hardware can take on Advanced commitments from the start.'}
      else if(acc==='yes'){t='certified';r='<b>Start at Certified.</b> The partner can list a container on WEDA now, which unlocks Certified benefits from day one.'+(proj==='yes'?' Move to Advanced once joint delivery grows.':'')}
      else {t='authorized';r='<b>Start at Authorized.</b> Without a listable container yet, begin with training and a first container; Certified follows once it is listed.'}
      ladder.forEach(function(li){li.classList.toggle('on',li.dataset.tier===t)});
      why.innerHTML=r;
    }
    form.addEventListener('change',tier); tier();
  }


  /* ---- lightbox ---- */
  var imgs=[].slice.call(document.querySelectorAll('.case img'));
  if(imgs.length && window.HTMLDialogElement){
    var dlg=document.createElement('dialog');dlg.className='lightbox';
    dlg.innerHTML='<button type="button">Close</button><img alt=""><p></p>';
    document.body.appendChild(dlg);
    var big=dlg.querySelector('img'), cap=dlg.querySelector('p');
    function open(im){big.src=im.dataset.full||im.currentSrc||im.src;big.alt=im.alt;cap.textContent=im.alt;dlg.showModal()}
    imgs.forEach(function(im){
      im.classList.add('zoomable');im.tabIndex=0;im.setAttribute('role','button');
      im.setAttribute('aria-label','Enlarge image: '+im.alt);
      im.addEventListener('click',function(){open(im)});
      im.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(im)}});
    });
    dlg.querySelector('button').addEventListener('click',function(){dlg.close()});
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  }

  /* ---- scrollspy for project bar ---- */
  var links=[].slice.call(document.querySelectorAll('.jump-bar a[href^="#"]'));
  if(links.length && 'IntersectionObserver' in window){
    var map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          links.forEach(function(a){a.classList.remove('is-active');a.removeAttribute('aria-current')});
          var a=map[en.target.id]; if(a){a.classList.add('is-active');a.setAttribute('aria-current','true');
            var bar=a.closest('.jump'); if(bar&&bar.scrollWidth>bar.clientWidth) bar.scrollTo({left:a.parentNode.offsetLeft-bar.offsetLeft-16,behavior:'smooth'});}
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el)});
  }

  /* ---- filter ---- */
  var fbtns=[].slice.call(document.querySelectorAll('.seg.filter button'));
  if(fbtns.length){
    var grouped=[].slice.call(document.querySelectorAll('#work [data-group]'));
    function applyFilter(f){
      if(['internship','school'].indexOf(f)<0) f='internship';
      fbtns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.filter===f))});
      grouped.forEach(function(el){el.hidden=el.dataset.group!==f});
    }
    fbtns.forEach(function(b){b.addEventListener('click',function(){
      applyFilter(b.dataset.filter);
      var u=new URL(location.href); if(b.dataset.filter==='internship') u.searchParams.delete('filter'); else u.searchParams.set('filter',b.dataset.filter);
      history.replaceState(null,'',u);
      var w=document.getElementById('work'); if(w.getBoundingClientRect().top<0) w.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    })});
    applyFilter(new URLSearchParams(location.search).get('filter')||'internship');
  }

  /* ---- about card carousel ---- */
  [].forEach.call(document.querySelectorAll('[data-carousel]'),function(card){
    var slides=[].slice.call(card.querySelectorAll('.qa-slide'));
    var dots=[].slice.call(card.querySelectorAll('.qa-dot'));
    var prev=card.querySelector('.qa-prev'), next=card.querySelector('.qa-next'), count=card.querySelector('.qa-count');
    var cur=0;
    function go(i){
      if(i<0||i>=slides.length) return;
      card.classList.toggle('back', i<cur);
      cur=i;
      slides.forEach(function(s,j){s.hidden=j!==i});
      dots.forEach(function(d,j){if(j===i)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current')});
      prev.disabled=i===0; next.disabled=i===slides.length-1;
      count.textContent=(i+1)+' / '+slides.length;
    }
    prev.addEventListener('click',function(){go(cur-1)});
    next.addEventListener('click',function(){go(cur+1)});
    dots.forEach(function(d,j){d.addEventListener('click',function(){go(j)})});
    card.addEventListener('keydown',function(e){
      if(e.target.closest('a')) return;
      if(e.key==='ArrowRight'){go(cur+1)} else if(e.key==='ArrowLeft'){go(cur-1)}
    });
    var x0=null;
    card.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    card.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)go(cur+(dx<0?1:-1));x0=null});
    function fit(){
      var h=0;
      slides.forEach(function(s){var was=s.hidden;s.hidden=false;s.style.animation='none';h=Math.max(h,s.offsetHeight);s.hidden=was;s.style.animation=''});
      slides.forEach(function(s){s.style.minHeight=h+'px'});
    }
    fit(); addEventListener('resize',function(){slides.forEach(function(s){s.style.minHeight=''});fit()});
    go(0);
  });
})();
