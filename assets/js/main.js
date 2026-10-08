// scroll reveal
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.08 });
  els.forEach(function (e) { io.observe(e); });
})();

// lightbox
(function () {
  var lb = document.getElementById('lb'); if (!lb) return;
  var img = lb.querySelector('img'), cap = lb.querySelector('.lb-cap');
  var links = Array.prototype.slice.call(document.querySelectorAll('a.wi'));
  var cur = -1;
  function show(i) { cur = (i + links.length) % links.length; img.src = links[cur].getAttribute('href'); cap.textContent = links[cur].getAttribute('data-cap') || ''; lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function hide() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); show(i); }); });
  lb.querySelector('.lb-close').addEventListener('click', hide);
  lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target === img) hide(); });
  document.addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') hide(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
})();
