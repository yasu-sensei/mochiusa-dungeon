const IMAGES={"woodClosed": "images/02d7728ee3cecb71.webp", "woodOpen": "images/ee6f8d2143d2415f.webp", "silverClosed": "images/dc839730999487d0.webp", "silverOpen": "images/b80fab7bb22bef08.webp", "goldClosed": "images/7878a4e891706de6.webp", "goldOpen": "images/8f70bb45625c043f.webp"};

let kind='wood',busy=false,runId=0;
const $=id=>document.getElementById(id),chest=$('chest'),sparkles=$('sparkles');
for(let i=0;i<7;i++){const s=document.createElement('span');s.className='spark';s.textContent=i%2===0?'✦':'✧';const a=i*Math.PI*2/7,r=105+(i%2)*15;s.style.setProperty('--x',Math.round(Math.cos(a)*r)+'px');s.style.setProperty('--y',Math.round(Math.sin(a)*r*.66)+'px');s.style.setProperty('--delay',(-i*.17)+'s');sparkles.appendChild(s)}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function notify(event){window.parent.postMessage({type:'mochiusa-chest-v1',event},'*')}
function init(k){kind=k;runId++;chest.className='chest';$('message').className='message';sparkles.className='sparkles';$('openBtn').className='openButton';$('reward').className='reward';$('warning').className='warning';$('iris').className='iris';$('light').className='light';$('mimicMonster').className='';$('closeBtn').style.display='none';const type=kind==='mimic'||kind==='emptywood'?'wood':kind;$('closed').src=IMAGES[type+'Closed'];$('opened').src=IMAGES[type+'Open'];document.documentElement.style.setProperty('--glow',type==='silver'?'#9cdcff':type==='gold'?'#ffca56':'#ffe4a0');start()}
async function start(){const id=runId;busy=true;chest.classList.add('pop');await wait(850);if(id!==runId)return;chest.className='chest rest';sparkles.classList.add('show');$('message').classList.add('show');await wait(950);if(id!==runId)return;$('openBtn').classList.add('show');busy=false}
async function openChest(){if(busy)return;busy=true;$('openBtn').classList.remove('show');$('message').classList.remove('show');sparkles.classList.remove('show');chest.className='chest rest shiver';await wait(900);chest.className='chest rest opening';await wait(160);if(kind==='mimic'){$('mimicMonster').classList.add('jump');await wait(1050);notify('mimic');return}$('light').classList.add('burst');sparkles.classList.add('show');await wait(1100);notify('opened')}
$('openBtn').addEventListener('click',openChest);
$('closeBtn').addEventListener('click',()=>notify('closed'));
window.addEventListener('message',e=>{if(e.data?.type==='mochiusa-chest-start'){init(e.data.kind)}else if(e.data?.type==='mochiusa-chest-reward'){$('reward').textContent=e.data.text;$('reward').classList.add('show');$('closeBtn').style.display='block'}});
window.parent.postMessage({type:'mochiusa-chest-v1',event:'ready'},'*');
