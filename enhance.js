(function(){
  function run(){
    document.querySelectorAll('img, image-slot').forEach(function(el){
      var p = el.parentElement; if(!p) return;
      var cs = getComputedStyle(p);
      if(cs.overflow==='hidden' || cs.borderRadius!=='0px'){ p.classList.add('zoomwrap'); }
    });
    var targets = [];
    document.querySelectorAll('section').forEach(function(s){
      Array.prototype.forEach.call(s.children, function(c){
        if(c.tagName==='SPAN' && c.getAttribute('aria-hidden')) return;
        if(c.classList.contains('reveal')) return;
        targets.push(c);
      });
    });
    if(!('IntersectionObserver' in window)){ targets.forEach(function(t){t.classList.add('reveal','in');}); }
    else {
      var io = new IntersectionObserver(function(ents){
        ents.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold:0.08, rootMargin:'0px 0px -8% 0px' });
      targets.forEach(function(t){ t.classList.add('reveal'); io.observe(t); });
    }
    setupLightbox();
    setupSimpleSliders();
  }
  function setupSimpleSliders(){
    document.querySelectorAll('[data-simple-slider]').forEach(function(sl){
      var strip = sl.querySelector('[data-simple-strip]');
      if(!strip) return;
      function move(dir){
        var w = strip.clientWidth;
        var max = strip.scrollWidth - w;
        var target;
        if(dir>0) target = strip.scrollLeft >= max-2 ? 0 : strip.scrollLeft + w;
        else target = strip.scrollLeft <= 2 ? Math.ceil(max/w)*w : strip.scrollLeft - w;
        strip.scrollTo({ left:target, behavior:'smooth' });
      }
      var p = sl.querySelector('[data-simple-prev]');
      var n = sl.querySelector('[data-simple-next]');
      if(p) p.addEventListener('click', function(e){ e.stopPropagation(); move(-1); });
      if(n) n.addEventListener('click', function(e){ e.stopPropagation(); move(1); });
    });
  }
  function setupLightbox(){
    if(document.querySelector('[data-lightbox]')) return;
    var lb = document.createElement('div');
    lb.setAttribute('data-lightbox','');
    lb.style.cssText = 'position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(58,20,36,0.92);padding:24px;cursor:zoom-out;';
    var lbImg = document.createElement('img');
    lbImg.alt = '';
    lbImg.style.cssText = 'max-width:94vw;max-height:90vh;border-radius:12px;box-shadow:0 30px 80px -20px rgba(0,0,0,0.6);object-fit:contain;';
    var lbClose = document.createElement('button');
    lbClose.setAttribute('aria-label','Zatvori');
    lbClose.textContent = '\u00d7';
    lbClose.style.cssText = 'position:absolute;top:18px;right:22px;width:44px;height:44px;border:none;border-radius:100px;background:rgba(255,255,255,0.16);color:#fff;font-size:24px;line-height:1;cursor:pointer;';
    lb.appendChild(lbImg);
    lb.appendChild(lbClose);
    var lbPrev = document.createElement('button');
    lbPrev.setAttribute('aria-label','Prethodna');
    lbPrev.textContent = '\u2039';
    lbPrev.style.cssText = 'position:absolute;top:50%;left:16px;transform:translateY(-50%);width:52px;height:52px;border:none;border-radius:100px;background:rgba(255,255,255,0.18);color:#fff;font-size:30px;line-height:1;cursor:pointer;';
    var lbNext = document.createElement('button');
    lbNext.setAttribute('aria-label','Slede\u0107a');
    lbNext.textContent = '\u203a';
    lbNext.style.cssText = 'position:absolute;top:50%;right:16px;transform:translateY(-50%);width:52px;height:52px;border:none;border-radius:100px;background:rgba(255,255,255,0.18);color:#fff;font-size:30px;line-height:1;cursor:pointer;';
    lb.appendChild(lbPrev);
    lb.appendChild(lbNext);
    document.body.appendChild(lb);
    var gallery = [], gi = 0;
    function show(){ lbImg.src = gallery[gi]; var multi = gallery.length > 1; lbPrev.style.display = multi ? 'block' : 'none'; lbNext.style.display = multi ? 'block' : 'none'; }
    function open(src, list, index){ if(!src && !(list&&list.length)) return; gallery = (list&&list.length)?list:[src]; gi = index||0; if(gi<0||gi>=gallery.length) gi=0; show(); lb.style.display='flex'; document.body.style.overflow='hidden'; }
    function close(){ lb.style.display='none'; lbImg.src=''; document.body.style.overflow=''; }
    function step(d){ if(!gallery.length) return; gi = (gi + d + gallery.length) % gallery.length; show(); }
    lbPrev.addEventListener('click', function(e){ e.stopPropagation(); step(-1); });
    lbNext.addEventListener('click', function(e){ e.stopPropagation(); step(1); });
    lbClose.addEventListener('click', function(){ close(); });
    lb.addEventListener('click', close);
    lbImg.addEventListener('click', function(e){ e.stopPropagation(); });
    document.addEventListener('keydown', function(e){ if(lb.style.display!=='flex') return; if(e.key==='Escape') close(); else if(e.key==='ArrowLeft') step(-1); else if(e.key==='ArrowRight') step(1); });
    function srcFrom(el){
      if(el.tagName==='IMG') return el.currentSrc || el.src;
      var slot = (el.matches && el.matches('image-slot')) ? el : (el.querySelector && el.querySelector('image-slot'));
      if(slot){
        var a = slot.getAttribute('src');
        if(a) return a;
        var ss = slot.shadowRoot && slot.shadowRoot.querySelector && slot.shadowRoot.querySelector('img');
        if(ss) return ss.currentSrc || ss.src;
      }
      var inner = el.querySelector && el.querySelector('img');
      if(inner) return inner.currentSrc || inner.src;
      return null;
    }
    document.querySelectorAll('.zoomwrap').forEach(function(w){
      if(w.closest('header')||w.closest('footer')) return;
      if(w.getAttribute('aria-hidden')) return;
      var probe = w.querySelector('img, image-slot');
      if(!probe) return;
      if(probe.getAttribute && probe.getAttribute('aria-hidden')) return;
      w.style.cursor='zoom-in';
      w.addEventListener('click', function(ev){
        var link = ev.target.closest ? ev.target.closest('a') : null;
        if(link) return;
        var s = srcFrom(w);
        if(s){ ev.preventDefault(); open(s); }
      });
    });
    document.querySelectorAll('[data-simple-strip], [data-strip]').forEach(function(strip){
      var slides = Array.prototype.slice.call(strip.children).filter(function(s){ return s.querySelector && s.querySelector('img, image-slot'); });
      slides.forEach(function(slide, idx){
        slide.style.cursor='zoom-in';
        slide.addEventListener('click', function(ev){
          var link = ev.target.closest ? ev.target.closest('a,button') : null;
          if(link) return;
          var list = slides.map(function(s){ return srcFrom(s); }).filter(Boolean);
          var s = srcFrom(slide);
          if(s){ ev.preventDefault(); open(s, list, list.indexOf(s)); }
        });
      });
    });
  }
  var timer=null, started=false, mo=null;
  function schedule(){
    if(started) return;
    clearTimeout(timer);
    timer=setTimeout(function(){
      if(!document.querySelector('section')){ timer=setTimeout(schedule,200); return; }
      started=true; if(mo) mo.disconnect(); run();
    }, 350);
  }
  function boot(){ mo=new MutationObserver(schedule); mo.observe(document.body,{childList:true,subtree:true}); schedule(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
