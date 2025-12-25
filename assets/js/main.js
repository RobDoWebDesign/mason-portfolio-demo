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

  function showIndex(i) {
    if (!lb || !lbImg) return;
    var nextIndex = (i + galleryImgs.length) % galleryImgs.length;
    currentIndex = nextIndex;

    var src = galleryImgs[currentIndex].getAttribute('src');
    var alt = galleryImgs[currentIndex].getAttribute('alt') || '';

    lbCaption.textContent = alt;

    // preload neighbors
    var next = new Image(); next.src = galleryImgs[(currentIndex+1)%galleryImgs.length].getAttribute('src');
    var prev = new Image(); prev.src = galleryImgs[(currentIndex-1+galleryImgs.length)%galleryImgs.length].getAttribute('src');

    // Clear manual sizing and onload
    lbImg.onload = null;
    lbImg.style.width = '';
    lbImg.style.height = '';
    lbImg.style.maxWidth = '';
    lbImg.style.maxHeight = '';
    
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', alt);

    if (!lb.classList.contains('open')) {
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
    }

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
});
