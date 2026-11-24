
const sprites={"0_0": "images/d53232930153cc8f.webp", "1_0": "images/f5dcbe15f535a4df.webp", "2_0": "images/bb3db842589154ec.webp", "3_0": "images/b55a6d9923b5e164.webp", "0_1": "images/730627ffc9482751.webp", "1_1": "images/09cf6c5b24dd376d.webp", "2_1": "images/3b0c448009ba91e7.webp", "3_1": "images/897f4e9810605dfa.webp", "0_2": "images/debc4eea12212ab4.webp", "1_2": "images/c0034a1b1a4ef1c9.webp", "2_2": "images/434981431e8e88d7.webp", "3_2": "images/55db315f32922f5a.webp"};
const $=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
$('mochi').src='images/a1c6b21fe72d524d.webp';
const enemyMax=parent.parent.__teacherMode?1:25;let hp=25,ehp=enemyMax,turn='start',busy=false,ended=false,potion=0,dice456=0,armed456=false,brokenShield=0,shieldReady=false,round=0;
const positions={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function showDie(n,id='die'){const el=$(id);const p=el.children;el.classList.toggle('one-face',n===1);for(let i=0;i<9;i++)p[i].style.visibility=positions[n]?.includes(i)?'visible':'hidden'}
showDie(1);showDie(1,'die2');
function ui(){ $('php').textContent=hp+' / 25';$('ehp').textContent=ehp+' / '+enemyMax;for(const [id,v] of [['pbar',hp],['ebar',ehp]]){$(id).style.width=v/(id==='ebar'?enemyMax:25)*100+'%';$(id).classList.toggle('low',v<=5)}$('roll').disabled=busy||ended||turn==='enemy';$('roll').textContent=turn==='start'?'🎯 ルーレットを まわす':'🎲 サイコロ';$('item').disabled=busy||ended||turn!=='hero';$('phase').textContent=ended?'けっちゃく！':turn==='start'?'せんこう こうこう':turn==='hero'?'モチウサの ばん':'モンスターの ばん'}
function message(t){$('status').textContent=t}
function modal(title,body,buttons){$('modal').innerHTML='<h2>'+title+'</h2><p>'+body+'</p>';for(const [label,fn,disabled] of buttons){const b=document.createElement('button');b.textContent=label;b.disabled=!!disabled;b.onclick=()=>{close();fn()};$('modal').append(b)}$('overlay').classList.add('show')}
function close(){$('overlay').classList.remove('show')}
// v1.9: one-off item cinematic overlay, separate from KO overlay
function itemFx(kind,icon,title,duration){
 const layer=document.createElement('div');layer.className='item-fx-layer';
 const effect=document.createElement('div');effect.className='item-fx item-fx-'+kind;
 const pic=document.createElement('div');pic.className='item-fx-icon';pic.textContent=icon;
 const label=document.createElement('div');label.className='item-fx-text';label.textContent=title;
 effect.append(pic);if(title)effect.append(label);layer.append(effect);document.body.append(layer);
 return new Promise(resolve=>setTimeout(()=>{layer.remove();resolve()},duration));
}
function updateItemIndicators(){
 document.querySelectorAll('.item-shield-mini,.item-armed-mini').forEach(el=>el.remove());
 const arena=document.querySelector('.arena');if(!arena)return;
 if(shieldReady){const e=document.createElement('div');e.className='item-shield-mini';e.textContent='🛡️';arena.append(e)}
 // 456ダイスの小さな装備マークは表示しない
}
async function activateItem(kind){
 if(busy||turn!=='hero'||ended)return;
 busy=true;ui();
 try{
  if(kind==='heal'&&potion>0&&hp<25){
   potion--;window.parent.postMessage({type:'chitei-item-used',item:'heal'},'*');const amount=3+Math.floor(Math.random()*5);const gained=Math.min(amount,25-hp);
   await itemFx('heal','🧪','',1550);hp+=gained;ui();await itemFx('heal','💗','+'+gained,1450);
  }else if(kind==='dice'&&dice456>0&&!armed456){
   armed456=true;
   const pair=$('dicePair'),d1=$('die'),d2=$('die2');
   pair.classList.add('item456-transform');
   showDie(6,'die');showDie(6,'die2');
   await sleep(1650);
   pair.classList.remove('item456-transform');
   pair.classList.add('item456-gold');
   await sleep(450);
  }else if(kind==='shield'&&brokenShield>0&&!shieldReady){
   brokenShield--;window.parent.postMessage({type:'chitei-item-used',item:'shield'},'*');shieldReady=true;await itemFx('shield','🛡️','',1450);
  }
 }finally{busy=false;updateItemIndicators();ui()}
}
function rand(n){return Math.floor(Math.random()*n)+1}
function monsterDie(){const r=Math.random();return r<.05?6:Math.floor(r/.19)+1}
// 参考ゲームの「左が先に止まる→右が期待を引っ張る」演出。
// 乱数は演出開始前に確定。見せかけの出目は結果に影響しない。
function audioTone(f,d=.09,vol=.045){try{const C=window.AudioContext||window.webkitAudioContext;if(!window._battleAudio)window._battleAudio=new C();const ctx=window._battleAudio;ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+d);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch(e){}}
function diceFlash(){const f=document.createElement('div');f.className='dice-screen-flash';document.body.append(f);setTimeout(()=>f.remove(),480)}
async function rollVisual(id,ms,limited=false){const el=$(id),start=performance.now();el.classList.add('rolling','dice-magic');while(performance.now()-start<ms){showDie(limited?4+Math.floor(Math.random()*3):rand(6),id);audioTone(180+Math.random()*90,.025,.012);const p=(performance.now()-start)/ms;await sleep(55+Math.round(p*p*180))}el.classList.remove('rolling','dice-magic')}
async function animateDice(isHero,targetHP){
 const d1=$('die'),d2=$('die2'),arena=document.querySelector('.arena');
 const boosted=isHero&&armed456;
 const results=isHero?(boosted?[4+Math.floor(Math.random()*3),4+Math.floor(Math.random()*3)]:[rand(6),rand(6)]):[monsterDie(),monsterDie()];
 if(boosted){armed456=false;dice456--;window.parent.postMessage({type:'chitei-item-used',item:'dice'},'*');updateItemIndicators();}
 const tense=targetHP<=12||hp<=8||ehp<=8;
 arena.classList.toggle('dice-tense',tense);
 for(const d of [d1,d2])d.classList.remove('dice-high','dice-finisher','dice-land','dice-first-glow','dice-zorome','fate-spin','fate-blank','fate-reveal');
 let firstDone=false;
 const spin1=(async()=>{await rollVisual('die',tense?1300:950,boosted);showDie(results[0],'die');d1.classList.add('dice-land');audioTone(115,.16,.11);firstDone=true})();
 const spin2=(async()=>{
   while(!firstDone){showDie(boosted?4+Math.floor(Math.random()*3):rand(6),'die2');await sleep(72)}
   // 1個目が止まった後、2個目の出目でHPを0にできる場合のみ特別演出。
   const possible=results[0]+6>=targetHP;
   if(possible){
     arena.classList.add('fate-rainbow');d2.classList.add('fate-spin');
     audioTone(392,.19,.04);await sleep(140);
     audioTone(523,.2,.04);await sleep(160);
     audioTone(659,.23,.04);
   }
   await rollVisual('die2',possible?1600:tense?1100:750,boosted);
   d2.classList.remove('fate-spin');
   if(possible){
     // 目を隠して音を止める「静寂」。確定した結果は変更しない。
     d2.classList.add('fate-blank');await sleep(420);
     d2.classList.remove('fate-blank');
     showDie(results[1],'die2');
     d2.classList.add('fate-reveal');arena.classList.add('fate-impact');
     diceFlash();audioTone(95,.3,.13);audioTone(330,.3,.07);
     setTimeout(()=>arena.classList.remove('fate-impact'),650);
     await sleep(1020);
   }else{
     showDie(results[1],'die2');d2.classList.add('dice-land');audioTone(90,.2,.12);
   }
   arena.classList.remove('fate-rainbow');
 })();
 await Promise.all([spin1,spin2]);
 const total=results[0]+results[1];
 if(total>=targetHP){d1.classList.add('dice-finisher');d2.classList.add('dice-finisher')}
 $('rollText').textContent=results[0]+' ＋ '+results[1]+' ＝ '+total;
 await sleep(tense?550:350);
 arena.classList.remove('dice-tense');
 if(boosted)$('dicePair').classList.remove('item456-gold');
 return total;
}
function pop(side,n){const el=document.createElement('div');el.className='hitnum '+side;el.textContent='−'+n;$('enemyBox').closest('.fighters').append(el);setTimeout(()=>el.remove(),1000)}
function jolt(id,cls){const el=$(id);el.classList.remove('hurt','strike','enemystrike','herohurt','enemyhurt');void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),540)}
let rouletteAngle=0;
function showRoulette(on){$('rouletteWrap').classList.toggle('active',on);$('dicePair').style.display=on?'none':'flex'}
async function spinRoulette(){
 const wheel=$('rouletteWheel');const green=!window.CHITEI_FORCE_ENEMY_FIRST&&Math.random()<.5;
 // 上の矢印が止まる場所は4区画の中央。緑・赤はそれぞれ50％。
 const target=green?(Math.random()<.5?0:180):(Math.random()<.5?90:270);
 const current=((rouletteAngle%360)+360)%360;
 rouletteAngle+=360*6+((target-current+360)%360);
 wheel.style.transition='transform 3300ms cubic-bezier(.12,.78,.12,1)';
 wheel.style.transform=`rotate(${rouletteAngle}deg)`;
 await sleep(3450);
 return green;
}
async function rollClick(){if(busy||ended||turn==='enemy')return;busy=true;ui();if(turn==='start'){message('ルーレットで せんこうを きめよう！');const green=await spinRoulette();$('rollText').textContent=green?'🟢 みどり！':'🔴 あか！';turn=green?'hero':'enemy';message(green?'🟢 モチウサが せんこう！':'🔴 モンスターが せんこう！');await sleep(1050);showRoulette(false);busy=false;ui();if(turn==='enemy'){await sleep(600);enemyTurn()}return}
message('モチウサが サイコロを ふる！');const n=await animateDice(true,ehp);$('rollText').textContent=n+' ダメージ！';if(ehp<=n){await lethalAttack(true,n,n);return}jolt('heroBox','strike');await sleep(260);ehp=Math.max(0,ehp-n);jolt('enemyBox','enemyhurt');pop('left',n);message('モンスターに '+n+' ダメージ！');ui();await sleep(900);turn='enemy';busy=false;ui();await sleep(500);enemyTurn()}
async function enemyTurn(){if(ended||turn!=='enemy'||busy)return;busy=true;ui();message('モンスターが サイコロを ふる！');await sleep(380);const n=await animateDice(false,hp);$('rollText').textContent=n+' ダメージ！';const blocked=shieldReady?2+Math.floor(Math.random()*4):0;shieldReady=false;const damage=Math.max(0,n-blocked);if(blocked){await itemFx('shatter','🛡️','−'+blocked,1200)}updateItemIndicators();if(hp<=damage){await lethalAttack(false,n,damage);return}jolt('enemyBox','enemystrike');await sleep(260);hp=Math.max(0,hp-damage);jolt('heroBox','herohurt');pop('right',damage);message('モチウサに '+damage+' ダメージ！');ui();await sleep(1000);turn='hero';busy=false;message('モチウサの ばん！ サイコロか アイテムを えらぼう');ui()}
async function finalParticles(){
 const target=$('enemyBox').querySelector('.character');const r=target.getBoundingClientRect();
 const dx=parseFloat(target.style.getPropertyValue('--flight-x'))||0,dy=parseFloat(target.style.getPropertyValue('--flight-ground'))||0;const cx=r.left+r.width*.45+dx,cy=r.top+r.height*.53+dy;
 const flash=document.createElement('div');flash.className='defeat-flash';document.body.append(flash);setTimeout(()=>flash.remove(),500);
 const layer=document.createElement('div');layer.className='defeat-particles';document.body.append(layer);
 const colors=['#fff9cf','#ffe79a','#fff','#b9efff','#d9baff'];
 for(let i=0;i<95;i++){const e=document.createElement('i');e.className='defeat-spark';const a=Math.random()*Math.PI*2,dist=45+Math.random()*155;
 e.style.left=cx+'px';e.style.top=cy+'px';e.style.setProperty('--sz',(4+Math.random()*9)+'px');e.style.setProperty('--clr',colors[i%colors.length]);
 e.style.setProperty('--dx',Math.cos(a)*dist+'px');e.style.setProperty('--dy',Math.sin(a)*dist+'px');e.style.setProperty('--dur',(1150+Math.random()*850)+'ms');layer.append(e)}
 await sleep(2200);layer.remove();
}
async function lethalAttack(win,n,damage){
 busy=true;ui();
 const attacker=$(win?'heroBox':'enemyBox'),loser=$(win?'enemyBox':'heroBox');
 const arena=document.querySelector('.arena');
 message('⚡ ちからを ためている…！');
 attacker.classList.add('final-charging');
 const aura=document.createElement('div');aura.className='final-aura';attacker.querySelector('.character').append(aura);
 await sleep(1850);aura.remove();attacker.classList.remove('final-charging');
 const caption=document.createElement('div');caption.className='final-caption';caption.textContent='💥 さいごの いちげき！';arena.append(caption);
 attacker.classList.add('final-striking');
 await sleep(570);
 // KO blow: the attack itself sets HP to zero, immediately before the cinematic flight.
 if(win)ehp=0;else hp=0;
 ui();pop(win?'left':'right',damage);
 arena.classList.add('ko-impact','ko-hitfreeze');
 const character=loser.querySelector('.character');
 const r=character.getBoundingClientRect(),a=arena.getBoundingClientRect();
 const currentX=r.left+r.width/2;
 const direction=win?-1:1;
 // Keep the character partially visible at the outer edge; travel starts from closer combat positions.
 const destination=win?a.left+Math.min(r.width*.34,65):a.right-Math.min(r.width*.34,65);
 const flightX=destination-currentX;
 const rise=Math.min(235,Math.max(85,Math.abs(flightX)*Math.tan(Math.PI/6)*.8));
 const ground=Math.min(115,Math.max(20,a.bottom-r.bottom-18));
 character.style.setProperty('--flight-x',flightX+'px');
 character.style.setProperty('--flight-up',-rise+'px');
 character.style.setProperty('--flight-ground',ground+'px');
 character.style.setProperty('--flight-rot',(direction*83)+'deg');
 loser.classList.remove('enemyhurt','herohurt','defeated','vanished');
 // Dramatic freeze-frame: sepia and silence before slow-motion flight.
 await sleep(800);
 arena.classList.remove('ko-hitfreeze','ko-impact','final-impact');
 arena.classList.add('ko-sepia');
 attacker.classList.remove('final-striking');caption.remove();
 const slow=document.createElement('div');slow.className='ko-color-overlay';
 slow.innerHTML='<span class="ko-letter ko-k">K</span><span class="ko-letter ko-o">O</span>';
 document.body.append(slow);
 audioTone(170,.38,.09);audioTone(92,.55,.10);
 loser.classList.add('final-launched');
 await sleep(3200);slow.remove();
 const dust=document.createElement('div');dust.className='ko-dust';
 const ar=arena.getBoundingClientRect();
 dust.style.left=(destination-ar.left)+'px';dust.style.top=(ar.height-34)+'px';arena.append(dust);
 audioTone(85,.35,.08);
 await sleep(650);
 if(win){
  message('✨ モンスターが ひかりになって きえた！');
  await finalParticles();loser.classList.add('final-gone');
 }else{
  message('💦 モチウサは たおれてしまった…');
  await sleep(1700);
 }
 dust.remove();arena.classList.remove('ko-sepia');
 await sleep(550);
 ended=true;turn='done';busy=false;ui();
 message(win?'🎉 モチウサの かち！':'💦 モンスターの かち…');
 modal(win?'🎉 しょうり！':'💦 まけちゃった…',win?'モンスターを たおした！':'また ちょうせん しよう！',[['たんけんに もどる',()=>window.parent.postMessage({type:'mochiusa-battle-result-v1',win:win},'*')]])
}

function reset(){$('enemyBox').classList.remove('defeated','vanished','final-launched','final-gone','final-charging','final-striking');$('heroBox').classList.remove('defeated','vanished','final-launched','final-gone','final-charging','final-striking');document.querySelectorAll('.character').forEach(el=>{el.style.removeProperty('--flight-x');el.style.removeProperty('--flight-up');el.style.removeProperty('--flight-ground');el.style.removeProperty('--flight-rot')});document.querySelectorAll('.defeat-particles,.defeat-flash,.ko-dust,.ko-slow-label').forEach(x=>x.remove());document.querySelector('.arena').classList.remove('ko-sepia','ko-hitfreeze','ko-impact');hp=25;ehp=enemyMax;turn='start';busy=false;ended=false;potion=0;dice456=0;armed456=false;brokenShield=0;shieldReady=false;updateItemIndicators();$('dicePair').classList.remove('item456-gold','item456-transform');round++;rouletteAngle=0;const wheel=$('rouletteWheel');wheel.style.transition='none';wheel.style.transform='rotate(0deg)';showRoulette(true);[$('die'),$('die2')].forEach(d=>d.classList.remove('dice-high','dice-finisher','dice-land','dice-pause','dice-slow','dice-magic','dice-first-glow','dice-zorome','fate-spin','fate-blank','fate-reveal'));document.querySelector('.arena').classList.remove('dice-tense','fate-rainbow','fate-impact');showDie(1);showDie(1,'die2');$('rollText').textContent='？';message('ルーレットで せんこうを きめよう！');ui();close()}
$('roll').onclick=rollClick;$('reset').onclick=reset;
$('item').onclick=()=>{if(busy||turn!=='hero'||ended)return;
 modal('🎒 アイテム','つかう アイテムを えらぼう。つかった アイテムは なくなるよ。',[
 ['💗 かいふくやく（HP 3〜7 かいふく） のこり'+potion,()=>activateItem('heal'),potion===0||hp===25],
 ['🎲 456ダイス（つぎの2こが 4・5・6） のこり'+dice456+(armed456?'【セットずみ】':''),()=>activateItem('dice'),dice456===0||armed456],
 ['🛡️ ボロボロのたて（つぎのダメージを 2〜5 へらす） のこり'+brokenShield+(shieldReady?'【そうびずみ】':''),()=>activateItem('shield'),brokenShield===0||shieldReady],
 ['もどる',()=>{}]
 ])};ui();
