(function(){
 const layout=document.querySelector('.layout'),left=layout?.querySelector('.left');
 const quick=document.querySelector('#dungeonTop .quick');
 if(!layout||!left||!quick)return;
 const status=document.createElement('aside');status.id='dungeonStatusPanel';
 const label=document.createElement('div');label.className='status-label';label.textContent='⛏️ つるはし';status.append(label);
 const pick=document.getElementById('topPick');if(pick)status.append(pick);
 const actions=document.createElement('nav');actions.id='dungeonActionPanel';actions.setAttribute('aria-label','ゲームメニュー');
 for(const id of ['openStudy','openItems','openBook']){const btn=document.getElementById(id);if(btn)actions.append(btn)}
 layout.insertBefore(status,left);layout.append(actions);
 const reset=document.getElementById('resetDungeonTest');if(reset)reset.remove();
})();