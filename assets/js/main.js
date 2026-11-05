/* Ольга Охлопкова — личный сайт психолога
   Скрипты: тема, дыхательное упражнение, самопроверка, мобильное меню, появление блоков. */

var HT=document.documentElement;
try{var sv=localStorage.getItem('theme');if(sv==='dark'||sv==='light')HT.setAttribute('data-theme',sv)}catch(e){}
document.getElementById('tg').onclick=function(){var cur=HT.getAttribute('data-theme');var dark=cur?cur==='dark':matchMedia('(prefers-color-scheme:dark)').matches;var next=dark?'light':'dark';HT.setAttribute('data-theme',next);try{localStorage.setItem('theme',next)}catch(e){}};
var Q=[['Что чаще всего забирает ваши силы?',[['Постоянная усталость и нехватка отдыха',0],['Обязательства перед другими',1],['Ощущение, что приходится справляться в одиночку',2],['Мысли, в которых трудно разобраться',3]]],
['Как вы реагируете, когда вас о чём-то просят?',[['Соглашаюсь, даже когда нет сил',1],['Тяну время и откладываю решение',3],['Беру на себя, потому что больше некому',2],['Делаю, а потом долго восстанавливаюсь',0]]],
['О чём вы чаще всего думаете перед сном?',[['Одни и те же вопросы без ответа',3],['Разговоры, в которых не удалось сказать «нет»',1],['Список дел, до которых не дошли руки',0],['Что рядом нет человека, с кем можно поделиться',2]]],
['Чего вам сейчас больше всего не хватает?',[['Поддержки и понимания',2],['Ясности: что мне на самом деле нужно',3],['Сил и отдыха',0],['Своего времени и границ',1]]],
['Что хотелось бы изменить в ближайший месяц?',[['Научиться говорить «нет» без вины',1],['Понять, в какую сторону двигаться',3],['Найти людей и опору рядом',2],['Наладить сон и восстановление',0]]]];
var R=[['Вам важно восстановить ресурс','Похоже, сил уходит больше, чем возвращается. На встрече можно подобрать реалистичный режим восстановления и разобраться, где утекает энергия.'],['Вам важны границы','Вы много отдаёте другим. Вместе можно потренироваться говорить «нет» без вины и заботиться о себе так же, как о близких.'],['Вам нужна опора','Справляться в одиночку тяжело. Терапия может стать местом, где вас слушают, а заодно помочь выстроить поддержку рядом.'],['Вам нужна ясность','Сейчас много мыслей и мало понимания, чего вы хотите. Разговор помогает навести порядок и увидеть следующий шаг.']];
var qi=0,sc=[0,0,0,0],qz=document.getElementById('qz');
function mk(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.textContent=h;return e}
function draw(){qz.textContent='';if(qi>=Q.length){var m=0;for(var k=1;k<4;k++)if(sc[k]>sc[m])m=k;qz.appendChild(mk('div','qn','Ваш результат'));qz.appendChild(mk('h3','','')).textContent=R[m][0];var p=mk('p','',R[m][1]);p.style.color='var(--mute)';qz.appendChild(p);var r=mk('div','row');r.style.marginTop='18px';var a=mk('a','btn','Обсудить результат на встрече');a.href='#contact';var b=mk('button','btn o','Пройти заново');b.onclick=function(){qi=0;sc=[0,0,0,0];draw()};r.appendChild(a);r.appendChild(b);qz.appendChild(r);var n=mk('p','qn','Это самопроверка, а не диагноз, и она не заменяет консультацию специалиста.');n.style.marginTop='16px';qz.appendChild(n);return}
var pb=mk('div','pb');pb.setAttribute('role','progressbar');pb.setAttribute('aria-valuemin','0');pb.setAttribute('aria-valuemax',Q.length);pb.setAttribute('aria-valuenow',qi);var i=mk('i');i.style.width=(qi/Q.length*100)+'%';pb.appendChild(i);qz.appendChild(pb);qz.appendChild(mk('div','qn','Вопрос '+(qi+1)+' из '+Q.length));qz.appendChild(mk('h3','',Q[qi][0]));var g=mk('div','qa');Q[qi][1].forEach(function(o){var bt=mk('button','',o[0]);bt.onclick=function(){sc[o[1]]++;qi++;draw();qz.querySelector('button,a')&&qz.querySelector('h3')&&qz.querySelector('h3').scrollIntoView({block:'nearest',behavior:'smooth'})};g.appendChild(bt)});qz.appendChild(g)}
draw();
var ph=document.getElementById('ph'),bl=document.getElementById('bl'),bn=document.getElementById('bn'),bs=document.getElementById('bs'),bg=document.getElementById('bgo');
var PH=[['Вдох',4],['Задержите дыхание',2],['Выдох',6]],N=4,tm=null,ci=0,pi=0,lf=0;
function phase(){var p=PH[pi];bl.textContent=p[0];lf=p[1];bn.textContent=lf;if(pi===0){ph.style.setProperty('--d','4s');ph.classList.add('in')}if(pi===2){ph.style.setProperty('--d','6s');ph.classList.remove('in')}bs.textContent='Цикл '+(ci+1)+' из '+N}
function stop(done){clearInterval(tm);tm=null;ph.style.setProperty('--d','3s');ph.classList.remove('in');bn.textContent='';bg.textContent=done?'Подышать ещё раз':'Подышать вместе';bl.textContent=done?'Хорошо. Как вы себя чувствуете?':'Хотите выдохнуть?';bs.textContent=done?'Если хочется разобраться глубже, пройдите самопроверку ниже.':'Минута дыхания: вдох 4 секунды, пауза, выдох 6'}
bg.onclick=function(){if(tm){stop(false);return}ci=0;pi=0;bg.textContent='Остановить';phase();tm=setInterval(function(){lf--;if(lf>0){bn.textContent=lf;return}pi++;if(pi>2){pi=0;ci++;if(ci>=N){stop(true);return}}phase()},1000)};
var mn=document.getElementById('mn'),mp=document.getElementById('mp');
function cm(){mp.hidden=true;mn.setAttribute('aria-expanded','false')}
mn.onclick=function(){var o=mp.hidden;mp.hidden=!o;mn.setAttribute('aria-expanded',String(o))};
mp.addEventListener('click',function(e){if(e.target.tagName==='A')cm()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')cm()});
var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting)x.target.classList.add('in')})},{threshold:.12});
document.querySelectorAll('.rv').forEach(function(e){io.observe(e)});
