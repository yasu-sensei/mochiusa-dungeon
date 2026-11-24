(function(){
 const left=document.querySelector('.layout>.left');
 const label=document.getElementById('floorLabel');
 const back=document.getElementById('backFloor1');
 const viewport=document.getElementById('viewport');
 if(!left||!label||!back||!viewport)return;
 const row=document.createElement('div');row.id='dungeonFloorRow';
 left.insertBefore(row,viewport);row.append(label,back);
 // Retain the existing floor-change handlers and show/hide behavior.
 if(typeof fitBoard==='function')fitBoard();
 window.addEventListener('resize',()=>{if(typeof fitBoard==='function')fitBoard()});
})();

(function(){
 const unlockKey='mochiusa_character_unlock_tenseiryu_v1', choiceKey='mochiusa_character_choice_v1';
 const panel=document.getElementById('dungeonActionPanel'),book=document.getElementById('openBook');
 if(!panel||!book)return;
 const button=document.createElement('button');button.type='button';button.id='openCharacter';button.textContent='🐉 キャラ へんこう';button.hidden=true;book.insertAdjacentElement('afterend',button);
 const originalFrame=frame;
 const directions=['down','right','up','left'];
 const images=[];
 for(const d of directions)for(let i=0;i<4;i++){const img=new Image();img.src='images/tenseiryu_'+d+'_'+i+'.png';images.push(img)}
 function unlocked(){return localStorage.getItem(unlockKey)==='1'}
 function selected(){return unlocked()&&localStorage.getItem(choiceKey)==='tenseiryu'}
 function dragonFrame(i){sprite.src='images/tenseiryu_'+directions[dir]+'_'+i+'.png'}
 frame=function(row){if(selected())dragonFrame(row===2?3:row===1?2:0);else originalFrame(row)};
 const originalHop=hop;
 hop=async function(nx,ny){
  if(!selected())return originalHop(nx,ny);
  const sx=x,sy=y,start=performance.now(),ms=440;
  await new Promise(resolve=>{function tick(t){const p=Math.min(1,(t-start)/ms),lift=Math.sin(Math.PI*p)*32;position(sx+(nx-sx)*p,sy+(ny-sy)*p,lift);dragonFrame(p<.18?1:p<.78?2:3);shadow.style.transform='scale('+(1-lift/95)+')';shadow.style.opacity=String(1-lift/65);if(p<1)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});
  x=nx;y=ny;state.x=x;state.y=y;state.steps++;position(x,y);frame(0);shadow.style.transform='';shadow.style.opacity='1';
 };
 function refresh(){if(currentFloor>=5||[5,6,7,8].some(f=>validFloor(readFloor(f))))localStorage.setItem(unlockKey,'1');button.hidden=!unlocked();button.style.display=unlocked()?'':'none'}
 const originalSave=save;save=function(){originalSave();refresh()};
 button.addEventListener('click',()=>{
  if(moving||!unlocked())return;
  const modal=document.getElementById('dungeonModal'),body=document.getElementById('dungeonModalBody'),heading=document.getElementById('dungeonModalTitle');
  heading.textContent='キャラクターを えらぼう';body.replaceChildren();
  const grid=document.createElement('div');grid.style.cssText='display:flex;gap:12px;justify-content:center;flex-wrap:wrap';
  for(const [key,name,src] of [['mochiusa','モチウサ',sprites['0_0']],['tenseiryu','テンセイリュウ','images/tenseiryu_down_0.png']]){
   const b=document.createElement('button');b.type='button';b.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;min-width:120px';
   const img=document.createElement('img');img.src=src;img.alt='';img.style.cssText='width:100px;height:100px;object-fit:contain';b.append(img,document.createTextNode(name+((key==='tenseiryu')===selected()?' ★':'')));
   b.onclick=()=>{localStorage.setItem(choiceKey,key);frame(0);modal.classList.remove('active')};grid.append(b);
  }body.append(grid);modal.classList.add('active');
 });
 refresh();frame(0);
})();
