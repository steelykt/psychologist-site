/* Ольга Охлопкова — личный сайт психолога
   Скрипты: тема, дыхательное упражнение, самопроверка, мобильное меню,
   появление блоков, кнопка MAX и цели Яндекс Метрики. */

/* ---------- Настройки: меняются только здесь ---------- */
var CONFIG = {
  // Ссылка на профиль в MAX. Пока пусто, кнопка MAX скрыта,
  // а в нижней панели на телефоне остаётся WhatsApp.
  MAX_URL: '',
  // Ссылка на страницу в VK. Пока пусто, кнопка VK скрыта.
  VK_URL: 'https://vk.ru/byolgaokhlopkova',
  // Номер счётчика Яндекс Метрики. 0 — цели никуда не отправляются.
  METRIKA_ID: 0,
  // Статистика подбора в таблицу для Ольги (см. docs/RESULTS_TABLE.md).
  // RESULTS_ENDPOINT: адрес приёма. Заполнен — после каждого прохождения уходит строка
  // БЕЗ имени и контактов (какая тема, формат, давность и т. д.).
  // PRIVACY_URL: страница политики. Заполнено вместе с адресом — под результатом появляется
  // необязательная форма «Оставить контакт», и контакт добавляется к той же строке статистики.
  RESULTS_ENDPOINT: '',
  PRIVACY_URL: ''
};

var HT = document.documentElement;
var REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

function $(id) { return document.getElementById(id); }

function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/* ---------- Цели Метрики ---------- */
function goal(name, params) {
  try {
    if (CONFIG.METRIKA_ID && window.ym) window.ym(CONFIG.METRIKA_ID, 'reachGoal', name, params);
  } catch (e) {}
}

// Любая ссылка или кнопка с data-goal="имя" отправляет цель по клику
document.addEventListener('click', function (e) {
  var t = e.target.closest ? e.target.closest('[data-goal]') : null;
  if (t) goal(t.getAttribute('data-goal'));
});

/* ---------- Кнопки MAX и VK: появляются, когда заполнена ссылка ---------- */
(function () {
  function show(attr, url) {
    [].forEach.call(document.querySelectorAll('[' + attr + ']'), function (a) {
      a.href = url;
      a.hidden = false;
    });
  }
  if (CONFIG.MAX_URL) {
    show('data-max', CONFIG.MAX_URL);
    // WhatsApp в нижней панели на телефоне уступает место MAX
    [].forEach.call(document.querySelectorAll('[data-nomax]'), function (a) { a.hidden = true; });
  }
  if (CONFIG.VK_URL) show('data-vk', CONFIG.VK_URL);
})();

/* ---------- Тема ---------- */
try {
  var saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') HT.setAttribute('data-theme', saved);
} catch (e) {}

$('tg').onclick = function () {
  var cur = HT.getAttribute('data-theme');
  var dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
  var next = dark ? 'light' : 'dark';
  HT.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
};

/* ---------- Подбор: тема, формат встреч и, по желанию, отправка Ольге ----------
   Вопросы выявляют потребность, а не ставят диагноз:
   1) тема запроса (совпадает с блоком «С чем помогаю»),
   2) где это ощущается сильнее всего,
   3) как давно и 4) насколько мешает повседневной жизни,
   5) чего человек ждёт от встреч, 6) удобный формат.
   Формат встреч подбирается по сумме баллов (см. recommendSeries). */
var TOPICS = [
  ['Тревога и стресс',
    'Судя по ответам, главная тема сейчас — тревога и напряжение. На встречах можно разобрать, какие мысли и ситуации их запускают, и найти другие способы справляться.'],
  ['Родительство',
    'Судя по ответам, сейчас важна тема родительства: усталость, чувство вины, отношения с ребёнком. На встрече можно разобрать конкретные ситуации и найти способы справляться.'],
  ['Жизненные перемены',
    'Судя по ответам, вы в периоде перемен. На встречах можно разобраться, что вас беспокоит, и найти опору для следующего шага.'],
  ['Самооценка и границы',
    'Судя по ответам, важна тема самооценки и границ. На встрече можно разобрать ситуации, где трудно отстоять себя, и найти другие способы реагировать.'],
  ['Пока неясно, с чего начать',
    'Это нормально: запрос часто проясняется в разговоре. На встрече вы вместе поймёте, что именно вас беспокоит.']
];

// [текст вопроса, ключ для таблицы, [[вариант ответа, баллы или номер темы], ...]]
var Q = [
  ['С чем вы хотели бы прийти?', 'topic', [
    ['Тревога, напряжение, стресс', 0],
    ['Родительство и отношения с ребёнком', 1],
    ['Перемены: работа, роль, город, выбор пути', 2],
    ['Самооценка, границы, отношения с людьми', 3],
    ['Пока сложно сказать', 4]]],
  ['Где это чувствуется сильнее всего?', 'area', [
    ['В теле и сне', 0],
    ['В настроении и мыслях', 0],
    ['В отношениях с близкими', 0],
    ['В работе и делах', 0]]],
  ['Как давно это продолжается?', 'duration', [
    ['Меньше месяца', 0],
    ['От месяца до полугода', 1],
    ['Больше полугода', 2],
    ['Сколько себя помню', 2]]],
  ['Насколько это мешает повседневной жизни?', 'interference', [
    ['Почти не мешает', 0],
    ['Иногда мешает', 0],
    ['Часто мешает', 1],
    ['Сильно мешает, трудно справляться', 1]]],
  ['Чего вы ждёте от встреч?', 'need', [
    ['Разобраться в одной конкретной ситуации', 0],
    ['Научиться справляться в целом, не только сейчас', 2],
    ['Пока не знаю, хочу обсудить с психологом', 1]]],
  ['Как вам удобнее встречаться?', 'meet', [
    ['Очно в Якутске', 0],
    ['Онлайн', 0],
    ['Подойдёт любой формат', 0]]]
];

var SERIES_FROM = 3; // с этой суммы баллов (давность + влияние + ожидания, максимум 5) предлагаем серию встреч
var qz = $('qz');
var answers = []; // выбранные варианты: [индекс варианта] для каждого вопроса

function opt(qi) { return Q[qi][2][answers[qi]]; }

// Пока тема неясна, всегда начинаем с разовой консультации
function recommendSeries() {
  if (opt(0)[1] === 4) return false;
  return opt(2)[1] + opt(3)[1] + opt(4)[1] >= SERIES_FROM;
}

// Последний вариант в вопросе про влияние: «Сильно мешает, трудно справляться»
function heavy() { return answers[3] === Q[3][2].length - 1; }

// Сводка для таблицы и для сообщения в мессенджер
function summary() {
  var out = {};
  Q.forEach(function (q, i) { out[q[1]] = opt(i)[0]; });
  out.recommend = recommendSeries() ? 'Серия встреч' : 'Разовая консультация';
  return out;
}

function statsEnabled() { return !!CONFIG.RESULTS_ENDPOINT; }
function contactEnabled() { return statsEnabled() && !!CONFIG.PRIVACY_URL; }

// Если статистика включена, честно меняем обещание «ответы нигде не сохраняются»
(function () {
  var intro = $('qintro');
  if (intro && statsEnabled()) {
    intro.textContent = 'Шесть коротких вопросов без регистрации. Это не диагностика: мы подскажем, какая тема и какой формат встреч вам, возможно, подойдут. Ответы без имени и контактов попадают в обезличенную статистику для Ольги. Контакт оставляете только вы сами и только по желанию.';
  }
})();

// Отправка в таблицу. Ответ сервера не читаем (так принимает Google Apps Script),
// поэтому успех означает «запрос ушёл без сетевой ошибки».
function post(data) {
  var ctrl = window.AbortController ? new AbortController() : null;
  var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 10000);
  return fetch(CONFIG.RESULTS_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data),
    signal: ctrl ? ctrl.signal : undefined
  }).then(function (r) { clearTimeout(to); return r; },
          function (e) { clearTimeout(to); throw e; });
}

// Случайный номер прохождения: связывает обезличенную строку с контактом, если человек его оставит
function newId() {
  var a = '';
  try {
    var u = new Uint8Array(8);
    crypto.getRandomValues(u);
    u.forEach(function (n) { a += ('0' + n.toString(16)).slice(-2); });
  } catch (e) {
    a = Math.random().toString(16).slice(2, 10) + Date.now().toString(16);
  }
  return a;
}

function payload(kind, rid, sum) {
  return {
    kind: kind, rid: rid, ts: new Date().toISOString(),
    topic: sum.topic, area: sum.area, duration: sum.duration,
    interference: sum.interference, need: sum.need, meet: sum.meet,
    recommend: sum.recommend,
    src: location.search.replace(/^\?/, '').slice(0, 200)
  };
}

function keepInView() {
  if (qz.scrollIntoView) qz.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
}

// Подсветка подходящего формата в блоке «Форматы и стоимость»
function markPrice(series) {
  var one = $('p-one'), ser = $('p-series');
  [one, ser].forEach(function (c) {
    if (!c) return;
    c.classList.remove('rec');
    var old = c.querySelector('.rc');
    if (old) old.remove();
  });
  if (series === null) return;
  var card = series ? ser : one;
  if (!card) return;
  card.classList.add('rec');
  card.appendChild(el('span', 'rc', 'Подходит вам'));
}

function drawQuestion() {
  var i = answers.length;
  var q = Q[i];

  var bar = el('div', 'pb');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Прогресс подбора');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(Q.length));
  bar.setAttribute('aria-valuenow', String(i + 1));
  var fill = el('i');
  fill.style.width = ((i + 1) / Q.length * 100) + '%';
  bar.appendChild(fill);
  qz.appendChild(bar);

  var head = el('div', 'qh');
  head.tabIndex = -1;
  head.appendChild(el('div', 'qn', 'Вопрос ' + (i + 1) + ' из ' + Q.length));
  head.appendChild(el('h3', '', q[0]));
  qz.appendChild(head);

  var list = el('div', 'qa');
  q[2].forEach(function (o, oi) {
    var b = el('button', '', o[0]);
    b.type = 'button';
    b.onclick = function () {
      if (answers.length === 0) goal('quiz_start');
      answers.push(oi);
      draw(true);
      keepInView();
    };
    list.appendChild(b);
  });
  qz.appendChild(list);

  if (i > 0) {
    var back = el('button', 'lk', '← Назад');
    back.type = 'button';
    back.onclick = function () { answers.pop(); draw(true); };
    qz.appendChild(back);
  }
}

function drawResult() {
  var sum = summary();
  var series = recommendSeries();
  var topic = TOPICS[opt(0)[1]];
  goal('quiz_done', { quiz: { topic: topic[0], recommend: sum.recommend } });
  markPrice(series);
  var rid = null;
  if (statsEnabled()) {
    rid = newId();
    post(payload('stat', rid, sum)).catch(function () {}); // статистика не должна мешать человеку
  }

  var head = el('div', 'qh');
  head.tabIndex = -1;
  head.appendChild(el('div', 'qn', 'Ваш результат'));
  head.appendChild(el('h3', '', topic[0]));
  qz.appendChild(head);

  var p = el('p', '', topic[1]);
  p.style.color = 'var(--mute)';
  qz.appendChild(p);

  var fmt = el('p', '');
  var strong = el('b', '', series ? 'Вам может подойти серия встреч. ' : 'Лучше начать с разовой консультации. ');
  fmt.appendChild(strong);
  fmt.appendChild(document.createTextNode(series
    ? 'Тема давняя или заметно мешает, поэтому несколько встреч по 50 минут могут быть удобнее. Подробности в блоке «Форматы и стоимость».'
    : 'Одна встреча поможет разобраться в ситуации, а потом вы вместе решите, нужны ли ещё. Подробности в блоке «Форматы и стоимость».'));
  qz.appendChild(fmt);

  if (heavy()) {
    qz.appendChild(el('p', 'qn cr hv', 'Если сейчас очень тяжело, не ждите записи: звоните 112 или обращайтесь в местную службу экстренной психологической помощи.'));
  }

  // Сообщение в Telegram уже написано: диалог не начинается с нуля
  var text = 'Здравствуйте! Хочу обсудить запись. Тема: ' + topic[0] + '. Подойдёт: ' + sum.recommend.toLowerCase() + '. Формат: ' + sum.meet.toLowerCase() + '.';
  var row = el('div', 'row');
  var a = el('a', 'btn', 'Написать в Telegram');
  a.href = 'https://t.me/olyabud?text=' + encodeURIComponent(text);
  a.rel = 'noopener';
  a.setAttribute('data-goal', 'quiz_cta');
  var more = el('a', 'btn o', 'Другие способы связи');
  more.href = '#contact';
  row.appendChild(a);
  row.appendChild(more);
  qz.appendChild(row);

  if (contactEnabled() && rid) qz.appendChild(buildSendForm(sum, rid));

  var again = el('button', 'lk', 'Пройти заново');
  again.type = 'button';
  again.onclick = function () { answers = []; markPrice(null); draw(true); };
  qz.appendChild(again);

  var note = 'Это не диагноз и не заменяет консультацию специалиста.';
  if (statsEnabled()) note += ' Ваши ответы без имени и контактов учтены в обезличенной статистике.';
  qz.appendChild(el('p', 'qn', note));
}

/* Необязательный контакт. Строка статистики уже отправлена без имени; здесь человек
   по желанию добавляет контакт к той же строке (по номеру прохождения rid).
   Галочка согласия не ставится заранее, без неё форма не отправляется. */
function buildSendForm(sum, rid) {
  var wrap = el('form', 'fm');
  wrap.appendChild(el('b', '', 'Оставить контакт'));
  wrap.appendChild(el('span', 'qn', 'Необязательно. Ольга свяжется с вами, а контакт добавится к вашему результату.'));

  function field(ph, name, required) {
    var i = el('input');
    i.type = 'text';
    i.name = name;
    i.placeholder = ph;
    i.maxLength = 120;
    i.required = !!required;
    i.autocomplete = name === 'name' ? 'given-name' : 'off';
    i.setAttribute('aria-label', ph);
    return i;
  }
  var name = field('Как к вам обращаться', 'name', false);
  var contact = field('Телефон или Telegram для связи', 'contact', true);
  var hp = field('Не заполняйте это поле', 'site', false);
  hp.className = 'hp';
  hp.tabIndex = -1;
  hp.setAttribute('aria-hidden', 'true');

  var lab = el('label', 'ck');
  var cb = el('input');
  cb.type = 'checkbox';
  cb.required = true;
  lab.appendChild(cb);
  var t = el('span');
  t.appendChild(document.createTextNode('Согласен(на) на передачу контакта и ответов Ольге для связи со мной. '));
  var pol = el('a', '', 'Политика обработки данных');
  pol.href = CONFIG.PRIVACY_URL;
  pol.target = '_blank';
  pol.rel = 'noopener';
  t.appendChild(pol);
  lab.appendChild(t);

  var send = el('button', 'btn o', 'Отправить контакт');
  send.type = 'submit';
  var status = el('p', 'qn');
  status.setAttribute('role', 'status');

  [name, contact, hp, lab, send, status].forEach(function (n) { wrap.appendChild(n); });

  wrap.onsubmit = function (e) {
    e.preventDefault();
    if (hp.value) return; // защита от автоматических отправок
    var data = payload('contact', rid, sum);
    data.name = name.value.trim();
    data.contact = contact.value.trim();
    send.disabled = true;
    status.textContent = 'Отправляем…';
    post(data).then(function () {
      status.textContent = 'Отправлено. Ольга свяжется с вами.';
      goal('quiz_sent');
    }).catch(function () {
      send.disabled = false;
      status.textContent = 'Не получилось отправить. Напишите Ольге в Telegram: кнопка выше.';
    });
  };
  return wrap;
}

// После каждого ответа блок перерисовывается, поэтому фокус переносим на новый
// вопрос: иначе при управлении с клавиатуры он сбрасывается в начало страницы.
function draw(moveFocus) {
  qz.textContent = '';
  if (answers.length >= Q.length) drawResult(); else drawQuestion();
  if (moveFocus) {
    var h = qz.querySelector('.qh');
    if (h) h.focus({ preventScroll: true });
  }
}
draw(false);

/* ---------- Дыхание: вдох 4 с, пауза 2 с, выдох 6 с, 4 цикла ---------- */
var ph = $('ph'), bl = $('bl'), bn = $('bn'), bs = $('bs'), bgo = $('bgo'), bmood = $('bmood');
var PHASES = [{ name: 'Вдох', sec: 4 }, { name: 'Пауза', sec: 2 }, { name: 'Выдох', sec: 6 }];
var CYCLES = 4;
var IDLE_COUNT = '4 · 2 · 6';
var IDLE_HINT = 'Вдох, пауза и выдох в секундах. Меньше минуты.';
var timer = null, cycle = 0, step = 0, left = 0;

function showPhase() {
  var p = PHASES[step];
  bl.textContent = p.name;
  left = p.sec;
  bn.textContent = left;
  if (step === 0) { ph.style.setProperty('--d', '4s'); ph.classList.add('in'); }
  if (step === 2) { ph.style.setProperty('--d', '6s'); ph.classList.remove('in'); }
  bs.textContent = 'Цикл ' + (cycle + 1) + ' из ' + CYCLES;
}

function stopBreath(done) {
  clearInterval(timer);
  timer = null;
  ph.style.setProperty('--d', '3s');
  ph.classList.remove('in');
  bn.textContent = IDLE_COUNT;
  bgo.textContent = done ? 'Подышать ещё раз' : 'Подышать вместе';
  bl.textContent = done ? 'Готово' : 'Хотите выдохнуть?';
  bs.textContent = done ? 'Если хочется разобраться глубже, ответьте на несколько вопросов ниже.' : IDLE_HINT;
  bmood.hidden = !done;
  if (done) goal('breath_done');
}

function tick() {
  left--;
  if (left > 0) { bn.textContent = left; return; }
  step++;
  if (step >= PHASES.length) {
    step = 0;
    cycle++;
    if (cycle >= CYCLES) { stopBreath(true); return; }
  }
  showPhase();
}

bgo.onclick = function () {
  if (timer) { stopBreath(false); return; }
  cycle = 0;
  step = 0;
  bgo.textContent = 'Остановить';
  bmood.hidden = true;
  goal('breath_start');
  showPhase();
  timer = setInterval(tick, 1000);
};

// Если вкладку свернули, упражнение останавливается: таймеры в фоне сбиваются
document.addEventListener('visibilitychange', function () {
  if (document.hidden && timer) stopBreath(false);
});

/* ---------- Мобильное меню ---------- */
var mn = $('mn'), mp = $('mp');
function closeMenu() { mp.hidden = true; mn.setAttribute('aria-expanded', 'false'); }
mn.onclick = function () {
  var open = mp.hidden;
  mp.hidden = !open;
  mn.setAttribute('aria-expanded', String(open));
};
mp.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

/* ---------- Появление блоков при прокрутке ---------- */
var blocks = document.querySelectorAll('.rv');
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (x) { if (x.isIntersecting) x.target.classList.add('in'); });
  }, { threshold: 0.12 });
  [].forEach.call(blocks, function (b) { io.observe(b); });
} else {
  [].forEach.call(blocks, function (b) { b.classList.add('in'); });
}
