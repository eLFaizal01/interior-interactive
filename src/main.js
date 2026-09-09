import './style.css';
import {Session,matchingTarget} from './core/session.js';
import {RoomScene} from './rooms/scene.js';

const app=document.querySelector('#app'), originalHome=app.innerHTML;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let config,registry,rooms,missions,decoys,theme,uiConfig;
let mode='challenge',roomId='bedroom',difficulty='easy',engine,session,gameAbort,frame,generation=0;
let pending=null,selected=null,keyboardPoint=null,freeSelected=null,movingObject=null,activeTargets=[],lastPhase='',toastTimeout,hintTimeout;
let muted=false,audioContext,suppressClickUntil=0;
const ui=(group,id)=>'/'+(registry?.[`ui.${group}.${id}`]?.path||`assets/images/ui/${group}/${id}.svg`);
const icon=id=>`<img src="${ui('icons',id)}" alt="" draggable="false"/>`;
const button=(action,label,style='secondary',symbol='')=>{
 const mapping={untimed:'continueUntimed',choose:'chooseRoom'};
 const spec=uiConfig?.buttons[mapping[action]||action];
 return `<button class="button ${spec?.style||style}" data-action="${action}">${spec?.icon||symbol?icon(spec?.icon||symbol):''}${escape(spec?.label||label)}</button>`;
};
const json=async path=>{const response=await fetch('/'+path);if(!response.ok)throw Error(path);return response.json();};

async function init(){
 try{
  [config,{assets:registry},{items:decoys},theme,uiConfig]=await Promise.all([json('config/game.json'),json('config/assets.json'),json('data/distractors.json'),json('config/ui-theme.json'),json('config/ui-components.json')]);
  [rooms,missions]=await Promise.all([Promise.all(config.roomIds.map(id=>json(`data/rooms/${id}.json`))),Promise.all(config.roomIds.map(id=>json(`data/missions/${id}.json`)))]);
  for(const [key,value]of Object.entries(theme.colors))document.documentElement.style.setProperty('--'+key,value);
  for(const [key,value]of Object.entries({teal:theme.colors.primary,ink:theme.colors.text,cream:theme.colors.surface,gold:theme.colors.accent}))document.documentElement.style.setProperty('--'+key,value);
  for(const variant of ['primary','secondary','accent'])for(const state of ['normal','hover','pressed'])document.documentElement.style.setProperty(`--button-${variant}-${state}`,`url('${ui('buttons',variant+'-'+state)}')`);
  document.documentElement.style.setProperty('--button-disabled',`url('${ui('buttons','disabled')}')`);
  home();registerTools();
 }catch(error){console.error(error);app.innerHTML=`<section class="error-screen"><h1>Belum bisa membuka ruangan</h1><p>Pastikan data permainan tersedia, lalu coba lagi.</p>${button('reload','Coba Lagi','primary','retry')}</section>`;}
}
function cleanup(){generation++;cancelAnimationFrame(frame);gameAbort?.abort();clearTimeout(toastTimeout);clearTimeout(hintTimeout);engine?.dispose();engine=null;session=null;pending=null;selected=null;freeSelected=null;movingObject=null;}
function home(){cleanup();app.innerHTML=originalHome;app.querySelector('.home-screen').style.backgroundImage=`url('${ui('backgrounds','menu-room')}')`;for(const el of app.querySelectorAll('[data-mode]')){const spec=uiConfig.buttons[el.dataset.mode];el.innerHTML=icon(spec.icon)+escape(spec.label);}app.querySelector('.home-copy>p').textContent=uiConfig.copy.subtitle;}
function choose(){
 cleanup();const room=rooms.find(r=>r.id===roomId);
 app.innerHTML=`<section class="selection-screen"><header class="selection-header">${button('home','Kembali','secondary','back')}<span class="brand">RUANG CERIA</span></header><div class="selection-heading"><div class="eyebrow">${mode==='challenge'?'MAIN TANTANGAN':'BERMAIN BEBAS'}</div><h1>Mau menata<br/><span>ruangan yang mana?</span></h1><p>${mode==='challenge'?'Pilih ruanganmu, lalu tentukan tantangannya.':'Buat susunan sesukamu. Tidak ada batas waktu.'}</p></div><div class="room-options" role="group" aria-label="Pilihan ruangan">${rooms.map((r,i)=>`<button class="room-option ${r.id===roomId?'selected':''}" data-room="${r.id}" aria-pressed="${r.id===roomId}"><span class="room-art room-art-${i}">${registry[r.thumbnailAssetId]?.path?`<img src="/${escape(registry[r.thumbnailAssetId].path)}" alt=""/>`:icon(r.id)}</span><span class="room-title">${escape(r.name)}</span><span class="room-description">${['Tempat beristirahat yang nyaman','Tempat berkumpul bersama','Tempat ide-ide kecil tumbuh'][i]}</span><span class="room-check">${icon('check')}</span></button>`).join('')}</div>${mode==='challenge'?`<fieldset class="difficulty"><legend>Pilih tantanganmu</legend><div class="difficulty-options">${Object.entries(config.difficulty).map(([key,d])=>`<button class="difficulty-choice ${key===difficulty?'selected':''}" data-difficulty="${key}" aria-pressed="${key===difficulty}"><strong>${d.label}</strong><span>${d.targetCount} benda · ${d.durationSeconds/60} menit${d.distractorCount?' · 2 pengecoh':''}</span></button>`).join('')}</div></fieldset>`:''}<div class="selection-footer"><span>${escape(room.name)}${mode==='challenge'?' · '+config.difficulty[difficulty].label:' · Tanpa waktu'}</span>${button('start','Ayo Mulai!','primary','play')}</div></section>`;
}
function toast(text){const el=document.querySelector('#toast');if(!el)return;el.textContent=text;el.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),3000);}
function showDialog(title,body,actions){const d=document.querySelector('#game-dialog');if(!d)return;d.innerHTML=`<div class="dialog-content"><h2 id="dialog-title">${title}</h2>${body}<div class="dialog-actions">${actions}</div></div>`;if(!d.open)d.showModal();}
function closeDialog(){document.querySelector('#game-dialog')?.close();}
function format(seconds){const n=Math.ceil(seconds);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
async function startGame(){
 cleanup();const token=generation,room=rooms.find(r=>r.id===roomId),mission=missions.find(m=>m.roomId===roomId),level=mission.levels[difficulty];
 activeTargets=room.targets.filter(t=>level.targetIds.includes(t.id));
 const distractors=decoys.filter(i=>level.distractorFurnitureIds.includes(i.id)).map(i=>({...i,furnitureId:i.id}));
 const allItems=mode==='freeplay'?room.targets:[...room.targets,...distractors];
 const panelItems=mode==='freeplay'?[...room.targets]:[...activeTargets,...distractors];
 if(mode==='challenge'&&distractors.length)panelItems.splice(2,0,...panelItems.splice(-2));
 app.innerHTML=`<section class="game-screen"><header class="game-header">${button('exit','Menu','secondary','home')}<div class="mission-title"><span class="eyebrow">${mode==='challenge'?config.difficulty[difficulty].label:'BERMAIN BEBAS'}</span><h2>${escape(room.name)}</h2></div><div class="hud-progress"><span id="progress-text"></span><progress id="progress-bar" value="0" max="${activeTargets.length}" aria-label="Furnitur terpasang" ${mode==='freeplay'?'hidden':''}></progress></div><div class="timer" role="timer" aria-live="off">${icon(mode==='challenge'?'timer':'infinity')}<span id="timer-text"></span></div></header><div class="game-body"><aside class="catalog" aria-label="Katalog furnitur"><div class="catalog-heading"><h2>Ayo pasang!</h2><p>Tarik benda ke ${mode==='challenge'?'bayangannya':'ruangan'}</p></div><div class="catalog-items">${panelItems.map(item=>`<button class="furniture-card" data-item="${item.furnitureId}" aria-label="Pilih ${escape(item.label)}" disabled><img class="furniture-thumb" alt="" draggable="false"/><span>${escape(item.label)}</span><img class="completion-badge" src="${ui('badges','complete')}" alt="Sudah dipasang" hidden/></button>`).join('')}</div><div class="catalog-footnote">${icon('drag')}<span>Bisa juga pilih benda, lalu ketuk tempatnya.</span></div></aside><div class="room-viewport" id="viewport" tabindex="0" aria-label="Area penempatan. Setelah memilih benda, gunakan panah untuk bergerak, Enter untuk memasang, Escape untuk membatalkan."><div class="loading-room" id="loading"><span class="spinner"></span>Menyiapkan ruanganmu…</div><div class="preview-note" id="preview-note" hidden>${icon('preview')}<div><strong>Lihat baik-baik, ya!</strong><span id="preview-count"></span></div></div><div class="ready-note" id="ready-note" hidden>Waktu mulai saat kamu menarik benda pertama.</div><div class="hint-label" id="hint-label" hidden></div><div class="toast" id="toast" role="status" aria-live="polite"></div><div class="placement-sparkle" id="sparkle" hidden><img src="${ui('effects','sparkle')}" alt=""/></div><div class="camera-note">${icon('camera')}<span>Geser untuk memutar · Gulir untuk mendekat</span></div><div class="game-toolbar">${mode==='challenge'?button('hint','Petunjuk','secondary','hint')+button('preview','Tampilan Awal','secondary','preview'):button('rotate','Putar benda','secondary','retry')+button('remove','Hapus benda','secondary','close')}${button('camera','Atur Kamera','secondary','camera')}${button('pause','Jeda','secondary','pause')}${button('sound',muted?'Suara mati':'Suara aktif','secondary',muted?'sound-off':'sound-on')}</div></div></div><dialog id="game-dialog" aria-labelledby="dialog-title"></dialog></section>`;
 document.querySelector('#timer-text').outerHTML='<div class="timer-copy"><span id="timer-text"></span><small id="timer-status" role="status"></small></div>';
 document.querySelector('#viewport').insertAdjacentHTML('beforeend','<div id="selection-banner" class="selection-banner" hidden><span id="selection-name" role="status" aria-live="polite"></span><button class="selection-dismiss" data-action="deselect" aria-label="Batalkan pilihan">×</button></div>');
 app.querySelectorAll('[data-item]').forEach(card=>card.insertAdjacentHTML('beforeend','<small class="selected-badge" hidden>Dipilih</small>'));
 gameAbort=new AbortController();const signal=gameAbort.signal;
 document.querySelector('#game-dialog').addEventListener('cancel',e=>{e.preventDefault();if(session?.phase==='paused')resume();},{signal});
 try{
  engine=new RoomScene(document.querySelector('#viewport'),registry,()=>toast('Ada model yang belum terbaca. Kita pakai furnitur contoh dulu, ya.'));
  const localEngine=engine;await engine.prepare(room,allItems,level.targetIds,mode==='freeplay');if(token!==generation)return;
  for(const item of panelItems){const img=app.querySelector(`[data-item="${item.furnitureId}"] .furniture-thumb`);const fallback=localEngine.thumbnail(item.furnitureId);img.src=registry[item.thumbnailAssetId]?.path?'/'+registry[item.thumbnailAssetId].path:fallback;img.onerror=()=>{img.onerror=null;img.src=fallback;};}
  session=new Session({duration:config.difficulty[difficulty].durationSeconds,targetIds:level.targetIds,previewSeconds:config.previewSeconds,now:performance.now(),freeplay:mode==='freeplay',startOn:config.timer.startOn});
  document.querySelector('#loading').remove();lastPhase='';
  if(mode==='challenge'){session.pause(performance.now());showDialog(escape(mission.instruction),'<p>Kita lihat contoh ruangan lengkap sebentar, lalu kamu bisa memasang benda yang hilang.</p><p>Waktu mulai setelah contoh selesai.</p>',button('begin-preview','Lihat Contohnya','primary','preview'));}
  bindGameEvents(signal);loop();
 }catch(error){if(token!==generation)return;console.error(error);engine?.dispose();engine=null;showDialog('Ruangan belum bisa dibuka','<p>Coba gunakan browser yang mendukung tampilan 3D, lalu buka lagi.</p>',button('choose','Kembali','primary','back'));}
}
function bindGameEvents(signal){
 app.querySelectorAll('[data-item]').forEach(card=>{
   card.addEventListener('pointerdown',e=>{
     if(e.button!==0||!session.canInteract()||card.disabled)return;
     e.preventDefault();
     card.setPointerCapture(e.pointerId);
     pending={id:card.dataset.item,x:e.clientX,y:e.clientY,pointerId:e.pointerId,active:false};
   },{signal});
   card.addEventListener('dragstart',e=>e.preventDefault(),{signal});
   card.addEventListener('click',()=>{if(performance.now()<suppressClickUntil||!session?.canInteract()||card.disabled)return;selectItem(card.dataset.item);},{signal});
 });
 document.addEventListener('pointermove',e=>{
   if(!pending||e.pointerId!==pending.pointerId)return;
   if(!pending.active&&Math.hypot(e.clientX-pending.x,e.clientY-pending.y)>7){if(!session.beginDrag(performance.now())){cancelDrag();return;}pending.active=true;selected=pending.id;movingObject=pending.existing||null;engine.dragStart(selected);if(movingObject){movingObject.visible=false;engine.drag.rotation.copy(movingObject.rotation);}unlockAudio();markSelection();}
   if(pending.active){e.preventDefault();updateDrag(engine.point(e.clientX,e.clientY));}
 },{signal,passive:false});
 document.addEventListener('pointerup',e=>{if(!pending||e.pointerId!==pending.pointerId)return;const active=pending.active;pending=null;if(active){suppressClickUntil=performance.now()+400;drop(engine.point(e.clientX,e.clientY));}},{signal});
 document.addEventListener('pointercancel',cancelDrag,{signal});
 const viewport=document.querySelector('#viewport');
 viewport.addEventListener('pointerdown',e=>{
   if(e.target!==engine.renderer.domElement||!session.canInteract())return;
   if(selected){e.preventDefault();e.stopPropagation();const point=engine.point(e.clientX,e.clientY);if(point&&session.beginDrag(performance.now())){unlockAudio();drop(point);}}
   else if(mode==='freeplay'){freeSelected=engine.pickFree(e.clientX,e.clientY);markSelection();if(freeSelected){e.stopPropagation();pending={id:freeSelected.name,existing:freeSelected,x:e.clientX,y:e.clientY,pointerId:e.pointerId,active:false};viewport.focus({preventScroll:true});toast('Geser benda, putar, atau hapus sesukamu.');}}
 },{signal,capture:true});
 viewport.addEventListener('keydown',e=>{
   if(!session.canInteract())return;if(e.key==='Escape'){cancelDrag(true);return;}if(!selected)return;
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
     e.preventDefault();if(!session.beginDrag(performance.now()))return;unlockAudio();keyboardPoint??={x:0,y:0,z:0};
     keyboardPoint.x=Math.max(-3.3,Math.min(3.3,keyboardPoint.x+(e.key==='ArrowRight'?.2:e.key==='ArrowLeft'?-.2:0)));
     keyboardPoint.z=Math.max(-3.3,Math.min(3.3,keyboardPoint.z+(e.key==='ArrowDown'?.2:e.key==='ArrowUp'?-.2:0)));
     if(!engine.drag)engine.dragStart(selected);markSelection();updateDrag(keyboardPoint);
   }else if(e.key==='Enter'&&keyboardPoint){e.preventDefault();drop(keyboardPoint);}
 },{signal});
 window.addEventListener('blur',()=>pause(true),{signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);},{signal});
}
function selectItem(id){if(!session?.canInteract())return;const target=activeTargets.find(t=>t.furnitureId===id);if(mode==='challenge'&&target&&session.placed.has(target.id))return;freeSelected=null;selected=id;keyboardPoint=null;engine.dragEnd();engine.controls.enabled=false;markSelection();toast('Sekarang ketuk tempatnya, atau gunakan panah dan Enter.');document.querySelector('#viewport').focus({preventScroll:true});}
function markSelection(){
 const id=selected||freeSelected?.name;
 app.querySelectorAll('[data-item]').forEach(card=>{const active=card.dataset.item===id;card.classList.toggle('selected',active);card.setAttribute('aria-pressed',String(active));card.querySelector('.selected-badge').hidden=!active;});
 const banner=document.querySelector('#selection-banner');
 if(banner){banner.hidden=!id;const item=rooms.find(r=>r.id===roomId)?.targets.find(t=>t.furnitureId===id)||decoys.find(d=>d.id===id);document.querySelector('#selection-name').textContent=id?`Dipilih: ${item?.label||id}`:'';}
 engine?.setSelection(engine.drag||(selected?null:freeSelected));
}
function updateDrag(point){engine.dragMove(point);const target=point&&mode==='challenge'?matchingTarget(activeTargets,session.placed,selected,point,config.interaction.snapDistanceMeters):null;engine.highlight(target?.id);}
function cancelDrag(clearObject=false){pending=null;selected=null;keyboardPoint=null;if(movingObject){movingObject.visible=true;movingObject=null;}if(clearObject)freeSelected=null;engine?.dragEnd();if(engine)engine.controls.enabled=!!session?.canInteract();markSelection();}
function drop(point){
 const id=selected;if(!id)return;session.tick(performance.now());
 if(point&&session.canInteract()){
   if(mode==='freeplay'){if(movingObject){movingObject.position.copy(point);freeSelected=movingObject;}else freeSelected=engine.placeFree(id,point);sound();toast('Bagus! Pilih benda lagi untuk menambah isi ruangan.');}
   else{const target=matchingTarget(activeTargets,session.placed,id,point,config.interaction.snapDistanceMeters);if(target&&session.place(target.id,performance.now())){sound();sparkle(target.transform.position);toast('Pas sekali!');}else toast(config.messages.wrongPlacement);}
 }else if(session.canInteract())toast(config.messages.wrongPlacement);
 cancelDrag();engine.sync(session);updateHUD();
}
function sparkle(position){const el=document.querySelector('#sparkle'),p=engine.project(position);el.style.left=p.x+'px';el.style.top=p.y+'px';el.hidden=false;el.classList.remove('burst');void el.offsetWidth;el.classList.add('burst');}
function unlockAudio(){if(!audioContext){try{audioContext=new(window.AudioContext||window.webkitAudioContext)();}catch{}}audioContext?.resume().catch(()=>{});}
function sound(celebrate=false){
 if(muted)return;unlockAudio();if(!audioContext)return;const entry=registry[celebrate?'audio.celebration':'audio.correct'];if(entry?.path){new Audio('/'+entry.path).play().catch(()=>{});return;}
 for(const [i,note]of (celebrate?[523,659,784]:[659,880]).entries()){const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=note;const t=audioContext.currentTime+i*.10;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.07,t+.02);gain.gain.exponentialRampToValueAtTime(.001,t+.28);osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.3);}
}
function updateHUD(){
 if(!session)return;document.querySelector('#timer-text').textContent=session.untimed?'Tanpa waktu':format(session.remaining);document.querySelector('.timer').classList.toggle('low',!session.untimed&&session.remaining<=30);
 const timerStatus=session.untimed?'Bermain santai':session.phase==='paused'?'Dijeda':session.phase==='preview'?'Melihat contoh':session.phase==='ready'?'Menunggu tarikan':session.phase==='playing'?'Waktu berjalan':session.phase==='timeout'?'Waktu selesai':'Selesai';
 const statusElement=document.querySelector('#timer-status');if(statusElement.textContent!==timerStatus)statusElement.textContent=timerStatus;
 document.querySelector('#progress-text').textContent=mode==='challenge'?`${session.placed.size}/${activeTargets.length} benda`:`${engine.freeObjects.length} benda terpasang`;document.querySelector('#progress-bar').value=session.placed.size;
 document.querySelector('#ready-note').hidden=session.phase!=='ready'||!!selected;document.querySelector('#preview-note').hidden=session.phase!=='preview';document.querySelector('#preview-count').textContent=`Ingat tempat bendanya · ${Math.ceil(session.previewRemaining)}`;
 app.querySelectorAll('[data-item]').forEach(card=>{const target=activeTargets.find(t=>t.furnitureId===card.dataset.item),complete=mode==='challenge'&&target&&session.placed.has(target.id);card.disabled=!session.canInteract()||!!complete;card.classList.toggle('complete',!!complete);card.querySelector('.completion-badge').hidden=!complete;});
 for(const action of ['hint','preview','rotate','remove']){const el=app.querySelector(`[data-action="${action}"]`);if(el)el.disabled=!session.canInteract()||(['rotate','remove'].includes(action)&&!freeSelected);}
 engine.controls.enabled=session.canInteract()&&!selected;
}
function phaseChange(){
 engine.sync(session);updateHUD();
 if(session.phase==='timeout'){cancelDrag();showDialog('Waktunya selesai!',`<p>Kamu sudah memasang <strong>${session.placed.size} dari ${activeTargets.length} benda.</strong></p><p>Kita bisa mencoba lagi atau menyelesaikan ruangan tanpa waktu.</p>`,button('retry','Coba Lagi','primary','retry')+button('untimed','Lanjut Tanpa Waktu','secondary','infinity'));}
 else if(session.phase==='won'){cancelDrag();const stars=session.stars();sound(true);showDialog('Hebat! Ruangannya lengkap!',`<div class="result-stars" aria-label="${stars} dari 3 bintang">${[1,2,3].map(n=>`<img src="${ui('rewards',n<=stars?'star-filled':'star-empty')}" alt=""/>`).join('')}</div><p>${session.untimed?'Kamu berhasil menyelesaikan semuanya!':`Semua benda terpasang. Sisa waktu <strong>${format(session.remaining)}</strong>.`}</p>`,button('choose','Pilih Ruangan','primary','home')+button('retry','Main Lagi','secondary','retry'));document.querySelector('.dialog-content').classList.add('celebration');}
}
function loop(){if(!engine||!session)return;session.tick(performance.now());if(lastPhase!==session.phase){lastPhase=session.phase;phaseChange();}updateHUD();engine.render();frame=requestAnimationFrame(loop);}
function pause(automatic=false){if(!session||!engine)return;if(session.pause(performance.now())){cancelDrag(true);showDialog('Istirahat sebentar, yuk!',`<p>${automatic?'Permainan dijeda saat kamu meninggalkan layar.':'Waktu berhenti. Ruanganmu menunggu di sini.'}</p>`,button('resume','Lanjut Main','primary','play')+button('choose','Pilih Ruangan','secondary','home'));}}
function resume(){if(session?.phase==='paused'){session.resume(performance.now());closeDialog();}}
function hint(){if(!session?.canInteract())return;const target=activeTargets.find(t=>!session.placed.has(t.id));if(!target)return;const label=document.querySelector('#hint-label'),point=engine.project(target.transform.position);label.style.left=point.x+'px';label.style.top=point.y+'px';label.textContent=`${target.label} di sini!`;label.hidden=false;engine.highlight(target.id);clearTimeout(hintTimeout);hintTimeout=setTimeout(()=>{label.hidden=true;engine?.highlight(null);},3500);}
app.addEventListener('click',e=>{
 const mb=e.target.closest('[data-mode]');if(mb&&rooms){mode=mb.dataset.mode;choose();return;}const rb=e.target.closest('[data-room]');if(rb){roomId=rb.dataset.room;choose();return;}const lb=e.target.closest('[data-difficulty]');if(lb){difficulty=lb.dataset.difficulty;choose();return;}
 const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;
 if(action==='home')home();else if(action==='choose')choose();else if(action==='start'||action==='retry')startGame();else if(action==='reload')location.reload();else if(action==='pause')pause();else if(action==='resume'||action==='begin-preview')resume();
 else if(action==='untimed'){session.continueUntimed(performance.now());closeDialog();}else if(action==='preview'){cancelDrag();session.preview(performance.now(),config.previewSeconds);}else if(action==='hint')hint();else if(action==='camera')engine?.controls.reset();
 else if(action==='sound'){muted=!muted;e.target.closest('[data-action]').innerHTML=icon(muted?'sound-off':'sound-on')+(muted?'Suara mati':'Suara aktif');}
 else if(action==='deselect')cancelDrag(true);
 else if(action==='rotate'&&freeSelected)freeSelected.rotation.y+=Math.PI/4;else if(action==='remove'&&freeSelected){engine.removeFree(freeSelected);freeSelected=null;markSelection();updateHUD();}
 else if(action==='exit'){if(!session){choose();return;}pause();showDialog('Kembali memilih ruangan?','<p>Susunan permainan ini akan dimulai lagi jika kamu keluar.</p>',button('choose','Pilih Ruangan','primary','home')+button('resume','Tetap Main','secondary','play'));}
});
function registerTools(){
 if(!document.modelContext?.registerTool)return;const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 const tools=[{name:'read_room_game',description:'Read the room, mode and active furnishing challenge progress.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({roomId,mode,difficulty,phase:session?.phase||'menu',placed:session?.placed.size||0,remaining:session?.remaining??null})},{name:'pause_room_game',description:'Pause the active furnishing game and open its pause dialog.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:()=>{if(!session?.canInteract())throw Error('No active playable game');pause();return{phase:session.phase};}}];
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
}
init();
