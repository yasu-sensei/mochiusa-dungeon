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