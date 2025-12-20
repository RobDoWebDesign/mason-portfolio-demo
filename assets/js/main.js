document.addEventListener('DOMContentLoaded',function(){
  var t=document.getElementById('nav-toggle');
  var n=document.getElementById('main-nav');
  if(t&&n){t.addEventListener('click',function(){n.classList.toggle('open')});}

  var form=document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit',function(e){
      // Use form's action (example uses Formspree). If not configured, fallback to mailto.
      var action=form.getAttribute('action')||'';
      if(action.indexOf('formspree.io')===-1){
        // fallback: open mail client
        e.preventDefault();
        var name=form.querySelector('[name="name"]').value||'';
        var email=form.querySelector('[name="email"]').value||'';
        var message=form.querySelector('[name="message"]').value||'';
        var subject=encodeURIComponent('Portfolio contact from '+name);
        var body=encodeURIComponent('From: '+name+' ('+email+')\n\n'+message);
        window.location.href='mailto:hello@mason.example?subject='+subject+'&body='+body;
      }
    });
  }
});

// --- Lightbox gallery (robust) ---
document.addEventListener('DOMContentLoaded', function () {
  var galleryImgs = Array.from(document.querySelectorAll('.gallery .card img'));
  if (!galleryImgs.length) return;

  // ensure each image has a data-index
  galleryImgs.forEach(function(img, i){ img.dataset.index = i; img.style.cursor = 'zoom-in'; });

  // ensure lightbox markup exists; create if missing
  var lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox'; lb.className = 'lightbox'; lb.setAttribute('aria-hidden','true'); lb.setAttribute('role','dialog');
    lb.innerHTML = '<button class="lb-close" aria-label="Close">×</button>'+
                   '<button class="lb-prev" aria-label="Previous">‹</button>'+
                   '<div class="lb-inner"><img src="" alt=""><div class="lb-caption"></div></div>'+
                   '<button class="lb-next" aria-label="Next">›</button>';
    document.body.appendChild(lb);
  }

  var lbImg = lb.querySelector('.lb-inner img');
  var lbCaption = lb.querySelector('.lb-caption');
  var lbClose = lb.querySelector('.lb-close');
  var lbPrev = lb.querySelector('.lb-prev');
  var lbNext = lb.querySelector('.lb-next');
  var currentIndex = 0;
  // default to fit mode (like browser scaled view)
  lb.classList.add('fit');

  function showIndex(i) {
    if (!lb || !lbImg) return;
    currentIndex = (i + galleryImgs.length) % galleryImgs.length;
    var src = galleryImgs[currentIndex].getAttribute('src');
    var alt = galleryImgs[currentIndex].getAttribute('alt') || '';
    // prepare onload handler before setting src (handle cached images correctly)
    lbImg.onload = null;
      lbImg.style.width = 'auto';
      lbImg.style.height = 'auto';
      lbImg.style.maxWidth = 'none';
      lbImg.style.maxHeight = 'none';
    lbCaption.textContent = alt;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    // prevent background from scrolling when lightbox open
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    // preload neighbors
    var next = new Image(); next.src = galleryImgs[(currentIndex+1)%galleryImgs.length].getAttribute('src');
    var prev = new Image(); prev.src = galleryImgs[(currentIndex-1+galleryImgs.length)%galleryImgs.length].getAttribute('src');
    // Clear any inline sizing so CSS can scale the image to fit viewport
    lbImg.style.width = '';
    lbImg.style.height = '';
    lbImg.style.maxWidth = '';
    lbImg.style.maxHeight = '';
    // prepare onload sizing: compute fit when in 'fit' mode
    lbImg.onload = function(){
      try{
        var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        var marginW = 120, marginH = 120;
        if (vw >= 1600) { marginW = 400; marginH = 200; }
        if (vw >= 2200) { marginW = 800; marginH = 300; }
        var natW = lbImg.naturalWidth || vw;
        var natH = lbImg.naturalHeight || vh;
        if (lb.classList.contains('fit')){
          var targetW = Math.max(100, vw - marginW);
          var targetH = Math.max(100, vh - marginH);
          // allow a small upscale for vertical/tall images so they appear a bit larger
          var isVertical = (natH / natW) > 1.15;
          var maxScale = isVertical ? 1.12 : 1.0; // ~12% upscale for tall images
          // Compute scale limited by width and height constraints
          var scaleW = targetW / natW;
          var scaleH = targetH / natH;
          var scale = Math.min(maxScale, scaleW, scaleH);
          var dispW = Math.round(natW * scale);
          var dispH = Math.round(natH * scale);
          // If image is portrait/tall, prefer sizing by height so top/bottom map to viewport
          if (isVertical) {
            lbImg.style.height = dispH + 'px';
            lbImg.style.width = 'auto';
            lbImg.style.maxHeight = dispH + 'px';
            lbImg.style.maxWidth = dispW + 'px';
          } else {
            lbImg.style.width = dispW + 'px';
            lbImg.style.height = 'auto';
            lbImg.style.maxWidth = dispW + 'px';
            lbImg.style.maxHeight = dispH + 'px';
          }
          // ensure image is centered in viewport
          lbImg.style.objectPosition = 'center center';
        } else {
          lbImg.style.width = 'auto';
          lbImg.style.height = 'auto';
          lbImg.style.maxWidth = 'none';
          lbImg.style.maxHeight = 'none';
        }
      }catch(e){ }
    };
    // now set src (after onload assigned) and alt
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', alt);
    // focus close for accessibility
    if (lbClose) lbClose.focus();
  }

  // Fit is the only mode — lightbox defaults to fit and no toggle is needed

  function hide() { if (!lb) return; lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); lbImg.removeAttribute('src'); }

  // ensure background unlocking when hidden
  var originalHide = hide;
  hide = function(){ originalHide(); document.documentElement.classList.remove('no-scroll'); document.body.classList.remove('no-scroll'); };

  // open when clicking image or its parent card
  galleryImgs.forEach(function(img){
    img.addEventListener('click', function(e){ e.preventDefault(); showIndex(parseInt(img.dataset.index,10)); });
    var card = img.closest('.card');
    if (card) card.addEventListener('click', function(e){ if (e.target === card) showIndex(parseInt(img.dataset.index,10)); });
  });

  lbClose && lbClose.addEventListener('click', hide);
  lbPrev && lbPrev.addEventListener('click', function(e){ e.stopPropagation(); showIndex(currentIndex-1); });
  lbNext && lbNext.addEventListener('click', function(e){ e.stopPropagation(); showIndex(currentIndex+1); });

  document.addEventListener('keydown', function(e){
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowRight') showIndex(currentIndex+1);
    if (e.key === 'ArrowLeft') showIndex(currentIndex-1);
  });

  // click backdrop to close if clicking outside inner
  lb.addEventListener('click', function(e){ if (e.target === lb) hide(); });
  // recalc on resize while open
  window.addEventListener('resize', function(){
    var lbOpen = document.getElementById('lightbox');
    if (!lbOpen || !lbOpen.classList.contains('open')) return;
    if (lbImg && lbImg.src) {
      // trigger onload logic by reassigning src
      var s = lbImg.src; lbImg.src = ''; lbImg.src = s;
    }
  });
});

