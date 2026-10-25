/* 나의 학습·진로 사용설명서 만들기 — 슬라이드 뷰어 */
(function () {
  'use strict';
  var W = 1333, H = 750;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var stage = $('#stage'), deck = $('#deck');
  var slides = Array.prototype.slice.call(deck.querySelectorAll('.slide'));
  var total = slides.length;
  var cur = 0, reading = false, lockIO = false, lockT;
  function lock(ms) { lockIO = true; clearTimeout(lockT); lockT = setTimeout(function () { lockIO = false; }, ms); }
  var noEl = $('#pgNo'), totEl = $('#pgTot'), prog = $('#prog');
  var ov = $('#ov'), ovg = $('#ovg'), ovBuilt = false;
  var toastEl = $('#toast'), toastT;

  function toast(msg, ms) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 2600);
  }

  /* ── 화면 크기에 맞춰 슬라이드 배율 계산 ── */
  function fit() {
    var r = stage.getBoundingClientRect(), k;
    if (reading) k = Math.min(1, (r.width - (r.width < 700 ? 16 : 56)) / W);
    else k = Math.min(r.width / W, r.height / H);
    document.documentElement.style.setProperty('--k', Math.max(k, .05).toFixed(4));
  }

  /* ── 이동 ── */
  function hasRv(s) { return s.hasAttribute('data-rv'); }
  function setHash(i) {
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { /* file:// 등에서는 무시 */ }
  }
  function render() {
    noEl.value = cur + 1;
    prog.style.width = ((cur + 1) / total * 100) + '%';
    document.title = (cur + 1) + '/' + total + ' · 나의 학습·진로 사용설명서 만들기';
    setHash(cur);
    if (ovBuilt) Array.prototype.forEach.call(ovg.children, function (t, i) { t.classList.toggle('cur', i === cur); });
  }
  function go(i, revealed) {
    i = Math.max(0, Math.min(total - 1, i));
    if (reading) {
      cur = i; render(); lock(900);
      slides[i].scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    slides[cur].classList.remove('on');
    cur = i;
    slides[cur].classList.add('on');
    slides[cur].classList.toggle('revealed', !!revealed);
    render();
  }
  function next() {
    if (!reading && hasRv(slides[cur]) && !slides[cur].classList.contains('revealed')) {
      slides[cur].classList.add('revealed'); return;
    }
    go(cur + 1, false);
  }
  function prev() { go(cur - 1, true); }

  /* ── 보기 모드 ── */
  function setReading(on) {
    reading = on;
    stage.classList.toggle('reading', on);
    document.body.classList.toggle('all-rev', on);
    $('#bRead').classList.toggle('on', on);
    $('#bRead').setAttribute('aria-pressed', on);
    if (on) { slides.forEach(function (s) { s.classList.remove('on'); }); }
    else { slides.forEach(function (s, i) { s.classList.toggle('on', i === cur); }); stage.scrollTop = 0; }
    fit();
    if (on) {
      lock(900);
      stage.style.scrollBehavior = 'auto';
      setTimeout(function () { slides[cur].scrollIntoView({ block: 'start' }); stage.style.scrollBehavior = ''; }, 30);
    }
  }
  function toggleFs() {
    var d = document, el = d.documentElement;
    if (!d.fullscreenElement) { (el.requestFullscreen || el.webkitRequestFullscreen || function () { toast('이 브라우저는 전체화면을 지원하지 않아요'); }).call(el); }
    else { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
  }
  d_fs();
  function d_fs() {
    var h = function () {
      var on = !!(document.fullscreenElement || document.webkitFullscreenElement);
      document.body.classList.toggle('fs', on);
      $('#bFs').classList.toggle('on', on);
      setTimeout(fit, 50);
    };
    document.addEventListener('fullscreenchange', h);
    document.addEventListener('webkitfullscreenchange', h);
    var t;
    document.addEventListener('mousemove', function () {
      if (!document.body.classList.contains('fs')) return;
      document.body.classList.add('show-bar'); clearTimeout(t);
      t = setTimeout(function () { document.body.classList.remove('show-bar'); }, 2200);
    });
  }

  /* ── 목차(오버뷰) ── */
  function buildOv() {
    if (ovBuilt) return;
    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'thumb'; b.setAttribute('aria-label', (i + 1) + '번 슬라이드로 이동');
      var w = document.createElement('div'); w.className = 'tw'; w.setAttribute('aria-hidden', 'true');
      var c = s.cloneNode(true); c.classList.remove('on'); c.removeAttribute('aria-label');
      Array.prototype.forEach.call(c.querySelectorAll('img'), function (im) { im.loading = 'lazy'; });
      Array.prototype.forEach.call(c.querySelectorAll('input,textarea,button'), function (x) { x.tabIndex = -1; });
      w.appendChild(c);
      var e = document.createElement('em'); e.textContent = i + 1;
      b.appendChild(w); b.appendChild(e);
      b.addEventListener('click', function () { closeOv(); go(i, true); });
      ovg.appendChild(b);
    });
    ovBuilt = true;
  }
  function openOv() {
    buildOv(); ov.hidden = false;
    Array.prototype.forEach.call(ovg.children, function (t, i) { t.classList.toggle('cur', i === cur); });
    var c = ovg.children[cur]; if (c) c.scrollIntoView({ block: 'center' });
  }
  function closeOv() { ov.hidden = true; }

  /* ── 이벤트 ── */
  $('#bPrev').addEventListener('click', function (e) { prev(); e.currentTarget.blur(); });
  $('#bNext').addEventListener('click', function (e) { next(); e.currentTarget.blur(); });
  $('#bOv').addEventListener('click', function (e) { openOv(); e.currentTarget.blur(); });
  $('#ovClose').addEventListener('click', closeOv);
  $('#bRead').addEventListener('click', function (e) { setReading(!reading); e.currentTarget.blur(); });
  $('#bFs').addEventListener('click', function (e) { toggleFs(); e.currentTarget.blur(); });
  $('#bPrint').addEventListener('click', function () { window.print(); });
  noEl.addEventListener('change', function () { var v = parseInt(noEl.value, 10); if (v) go(v - 1, false); noEl.blur(); });
  noEl.addEventListener('focus', function () { noEl.select(); });

  window.addEventListener('beforeprint', function () { document.body.classList.add('all-rev'); });
  window.addEventListener('afterprint', function () { if (!reading) document.body.classList.remove('all-rev'); });
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function () { var n = parseInt(location.hash.slice(1), 10); if (n && n - 1 !== cur) go(n - 1, false); });

  function isField(t) { return t && (t.matches('input,textarea,select') || t.isContentEditable); }
  function isAction(t) { return t && t.closest && t.closest('button,a,[data-tgl],[data-star]'); }
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (isField(t)) { if (e.key === 'Escape') t.blur(); return; }
    if (!ov.hidden) { if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') { e.preventDefault(); closeOv(); } return; }
    var k = e.key;
    if ((k === ' ' || k === 'Enter') && isAction(t)) return;      // 버튼·체크박스는 기본 동작 유지
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); go(0, false); }
    else if (k === 'End') { e.preventDefault(); go(total - 1, true); }
    else if (k === 'f' || k === 'F') toggleFs();
    else if (k === 'g' || k === 'G' || k === 'o' || k === 'O') openOv();
    else if (k === 'r' || k === 'R') setReading(!reading);
  });

  /* 화면 클릭 = 다음 / 좌우 스와이프 */
  stage.addEventListener('click', function (e) {
    if (reading) return;
    var t = e.target;
    if (t.closest('button,a,input,textarea,[data-tgl],[data-tgl2],[data-star],.chk,.dom')) return;
    next();
  });
  var sx = 0, sy = 0;
  stage.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (reading) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* 읽기 모드에서 스크롤 위치에 따라 현재 번호 갱신 */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (!reading || lockIO) return;
      es.forEach(function (en) { if (en.isIntersecting) { cur = slides.indexOf(en.target); render(); } });
    }, { root: stage, threshold: .55 });
    slides.forEach(function (s) { io.observe(s); });
  }

  /* ── 활동용 인터랙션 ── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tgl]');
    if (t) { var on = t.classList.toggle('on'); t.setAttribute('aria-checked', on); return; }
    var b = e.target.closest('[data-tgl2]');
    if (b) {
      Array.prototype.forEach.call(b.parentNode.querySelectorAll('button'), function (x) { if (x !== b) x.classList.remove('on'); });
      b.classList.toggle('on'); return;
    }
    var d = e.target.closest('[data-star]');
    if (d) {
      var max = +d.getAttribute('data-star') || 3, sl = d.closest('.slide');
      if (!d.classList.contains('on') && sl.querySelectorAll('[data-star].on').length >= max) { toast('★는 ' + max + '개까지 표시할 수 있어요'); return; }
      var on2 = d.classList.toggle('on'); d.setAttribute('aria-pressed', on2);
    }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && e.target.matches && e.target.matches('[data-tgl],[data-star]')) { e.preventDefault(); e.target.click(); }
  });

  /* 150초 타이머 (슬라이드 6) */
  (function () {
    var btn = $('#vidBtn'), out = $('#vidTime'), t = null, left = 150;
    function show() { out.textContent = Math.floor(left / 60) + ':' + ('0' + (left % 60)).slice(-2); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (t) { clearInterval(t); t = null; left = 150; show(); btn.textContent = '▶ 150초 타이머 시작'; return; }
      left = 150; show(); btn.textContent = '■ 멈추고 처음으로';
      t = setInterval(function () {
        left--; show();
        if (left <= 0) { clearInterval(t); t = null; out.textContent = '시간 종료!'; btn.textContent = '↻ 다시 시작'; }
      }, 1000);
    });
  })();

  /* AI 질문 카드 복사 (슬라이드 62) */
  (function () {
    var b = $('#aiCopy'); if (!b) return;
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var area = ($('#aiArea').value || '').trim() || '[        ]';
      var q = '나는 ' + area + ' 영역에 끌리는 학생이야. 10~15년 뒤 이 영역에서 AI가 바꿀 일과 새로 생길 직업 3개를 알려 줘';
      var done = function () { toast('질문을 복사했어요. AI에 붙여 넣어 보세요 (개인정보는 입력하지 않기)'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(q).then(done, function () { toast('복사에 실패했어요. 직접 선택해 복사해 주세요'); });
      else { var ta = document.createElement('textarea'); ta.value = q; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (x) { toast('복사에 실패했어요'); } ta.remove(); }
    });
  })();

  /* ── 시작 ── */
  totEl.textContent = total;
  var n0 = parseInt(location.hash.slice(1), 10);
  cur = (n0 >= 1 && n0 <= total) ? n0 - 1 : 0;
  slides[cur].classList.add('on');
  fit(); render();
  try {
    if (matchMedia('(max-width:700px) and (orientation:portrait)').matches && !sessionStorage.getItem('hint')) {
      sessionStorage.setItem('hint', '1');
      setTimeout(function () { toast('가로로 돌리면 슬라이드가 더 크게 보여요 · 좌우로 밀어 넘기기', 4200); }, 600);
    }
  } catch (e) { /* 저장소 사용 불가 시 무시 */ }
})();
