'use strict';
const teams=[
{id:'daegu',name:'대구 FC',short:'대구',sigil:'DG',sport:'축구 · K리그',color:'#58a8db',source:'https://m.sports.naver.com/kfootball/schedule/index',status:'일부 일정 확인 · KST 스코어'},
{id:'barca',name:'FC 바르셀로나',short:'바르사',sigil:'FCB',sport:'축구 · 라리가 / UCL',color:'#aa508d',source:'https://m.sports.naver.com/wfootball/schedule/index',status:'10월 일정 확인 · 구단 공식'},
{id:'lotte',name:'롯데 자이언츠',short:'롯데',sigil:'G',sport:'야구 · KBO',color:'#dd5b64',source:'https://m.sports.naver.com/kbaseball/schedule/index',status:'잔여 일정 확인 · LKBO'},
{id:'hle',name:'HLE',short:'HLE',sigil:'HLE',sport:'LoL · LCK',color:'#eb9555',source:'https://lolesports.com/ko-KR/',status:'다음 대진 확인 필요'},
{id:'blg',name:'BLG',short:'BLG',sigil:'BLG',sport:'LoL · LPL',color:'#62bbd1',source:'https://lolesports.com/ko-KR/',status:'다음 대진 확인 필요'},
{id:'ns',name:'농심 레드포스',short:'농심',sigil:'NS',sport:'발로란트 · VCT',color:'#c76b73',source:'https://www.vlr.gg/team/11060/nongshim-redforce',status:'다음 대진 확인 필요'},
{id:'f1',name:'Formula 1',short:'F1',sigil:'F1',sport:'모터스포츠',color:'#7f77c5',source:'https://www.formula1.com/en/latest/article/formula-1-singapore-airlines-singapore-grand-prix-2026.1OXwlTH5jrpTiZX2Dvg7qE.1OXwlTH5jrpTiZX2Dvg7qE',status:'싱가포르 일정 확인 · F1 공식'}];
let events=[];let loadSequence=0;const statuses=new Map();const loadedMonths=new Map();
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id), pad=n=>String(n).padStart(2,'0');
const kstNow=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Seoul'}));
const today=`${kstNow.getFullYear()}-${pad(kstNow.getMonth()+1)}-${pad(kstNow.getDate())}`;
let year=kstNow.getFullYear(),month=kstNow.getMonth(),selectedDay=null,active=new Set(teams.map(t=>t.id));
try{const saved=JSON.parse(localStorage.getItem('matchday-teams'));if(Array.isArray(saved))active=new Set(saved.filter(id=>teams.some(t=>t.id===id)));}catch{}
const teamOf=id=>teams.find(t=>t.id===id);
const sigil=t=>`<span class="team-sigil" style="--color:${t.color}"><img src="/logos/${t.id}.${t.id==='f1'?'svg':'png'}" alt="${t.name} 로고"></span>`;
function logoURL(src){try{return new URL(src).hostname==='owcdn.net'?'/api/logo?src='+encodeURIComponent(src):src;}catch{return '';}}
function matchup(e){if(!Array.isArray(e.participants)||e.participants.length!==2)return escapeHTML(e.title);return e.participants.map(p=>`<span class="match-team">${p.logo?`<img class="opponent-logo" src="${escapeHTML(logoURL(p.logo))}" alt="" loading="lazy" referrerpolicy="no-referrer">`:''}<span>${escapeHTML(p.name==='Nongshim RedForce'?'농심 레드포스':p.name)}</span></span>`).join('<span class="versus">vs</span>');}
function dayLabel(date){return new Date(`${date}T12:00:00+09:00`).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',weekday:'short'});}
function render(){
 $('teams').innerHTML=teams.map(t=>`<button class="team-filter" data-team="${t.id}" aria-pressed="${active.has(t.id)}" aria-label="${t.name} 일정 ${active.has(t.id)?'숨기기':'보기'}">${sigil(t)}<span class="team-name">${t.name}<small>${t.sport}</small></span><span class="check">${active.has(t.id)?'✓':''}</span></button>`).join('');
 document.querySelectorAll('[data-team]').forEach(b=>b.onclick=()=>{active.has(b.dataset.team)?active.delete(b.dataset.team):active.add(b.dataset.team);try{localStorage.setItem('matchday-teams',JSON.stringify([...active]));}catch{}render();});
 $('month').textContent=`${year}년 ${month+1}월`;$('month-picker').value=`${year}-${pad(month+1)}`;
 const visible=events.filter(e=>active.has(e.team)).sort((a,b)=>(a.date+(a.time||'99:99')).localeCompare(b.date+(b.time||'99:99'))), prefix=`${year}-${pad(month+1)}`;
 const monthly=visible.filter(e=>e.date.startsWith(prefix));
 const first=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate(),cells=Math.ceil((first+days)/7)*7;
 $('calendar').innerHTML=Array.from({length:cells},(_,i)=>{const d=new Date(year,month,i-first+1),date=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,ev=visible.filter(e=>e.date===date);return `<button class="day ${d.getMonth()!==month?'dim':''} ${date===today?'is-today':''} ${date===selectedDay?'selected':''}" data-date="${date}" aria-pressed="${date===selectedDay}" aria-label="${dayLabel(date)}, 등록된 일정 ${ev.length}개"><span class="day-number">${d.getDate()}</span>${ev.slice(0,2).map(e=>`<span class="event-chip" style="--color:${teamOf(e.team).color}" title="${e.time||'시간 미정'} ${escapeHTML(e.title)}">${e.time||'시간 미정'} ${teamOf(e.team).short}</span>`).join('')}${ev.length>2?`<span class="more">+${ev.length-2}개</span>`:''}</button>`;}).join('');
 document.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{selectedDay=selectedDay===b.dataset.date?null:b.dataset.date;const d=b.dataset.date.split('-').map(Number);if(d[0]!==year||d[1]-1!==month){year=d[0];month=d[1]-1;render();loadMonth();}else render();});
 $('count').textContent=`등록된 일정 ${monthly.length}개`;
 const list=selectedDay?visible.filter(e=>e.date===selectedDay):monthly;
 $('agenda-title').textContent=selectedDay?dayLabel(selectedDay):`${month+1}월 경기 일정`;$('reset-day').hidden=!selectedDay;
 $('agenda').innerHTML=list.length?list.map(e=>{const t=teamOf(e.team);return `<article class="match-card"><div class="match-top"><span>${dayLabel(e.date)}</span><time datetime="${e.date}T${e.time||'시간 미정'}:00+09:00">${e.time||'시간 미정'} KST · ${escapeHTML(e.status||'예정')}</time></div><div class="match-main">${e.participants?.length===2?"":sigil(t)}<h3 class="matchup">${matchup(e)}${e.score?`<strong class="score">${escapeHTML(e.score)}</strong>`:""}</h3></div><p>${escapeHTML(e.venue)} · <a href="${escapeHTML(e.source||t.source)}" target="_blank" rel="noopener noreferrer">일정 출처</a></p></article>`;}).join(''):`<div class="empty">${active.size?([...statuses.values()].some(r=>r.loading)?'경기 일정을 불러오는 중이에요.':([...statuses.values()].some(r=>!r.ok)?'일부 출처를 확인하지 못했어요.<br>아래 연결 상태를 확인해 주세요.':'이 기간에 확인된 경기가 없어요.')):'선택한 팀이 없어요.<br>보고 싶은 팀을 눌러 주세요.'}</div>`;
 document.querySelectorAll('.opponent-logo').forEach(img=>img.addEventListener('error',()=>{if(img.src.includes('6399bb707aacb.png')){img.src='/logos/ns.png';}else{img.style.display='none';}},{once:true}));
 const upcoming=visible.find(e=>e.time&&!['종료','취소','연기'].includes(e.status)&&new Date(`${e.date}T${e.time||'시간 미정'}:00+09:00`)>new Date());
 $('next-title').textContent=upcoming?upcoming.title:'다음 경기를 기다리는 중';
 $('next-meta').textContent=upcoming?`${teamOf(upcoming.team).sport} · ${upcoming.venue}`:'등록된 일정 중 다가오는 경기가 없습니다.';
 $('next-time').innerHTML=upcoming?`<small>${dayLabel(upcoming.date)}</small>${upcoming.time}`:'';
}
$('today-label').textContent=kstNow.toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);
function move(delta){const d=new Date(year,month+delta,1);year=d.getFullYear();month=d.getMonth();selectedDay=null;render();loadMonth();}
$('today').onclick=()=>{year=kstNow.getFullYear();month=kstNow.getMonth();selectedDay=today;render();loadMonth();};
$('reset-day').onclick=()=>{selectedDay=null;render();};
$('all-teams').onclick=()=>{active=new Set(teams.map(t=>t.id));try{localStorage.setItem('matchday-teams',JSON.stringify([...active]));}catch{}render();};
render();
function renderStatus(){
 $('source-list').innerHTML=teams.map(t=>{const id=t.id==='hle'||t.id==='blg'?'lol':t.id==='ns'?'vlr':t.id;const r=statuses.get(id);let message=r?(r.loading?'불러오는 중…':r.ok?`연결됨 · ${r.events.filter(e=>e.team===t.id).length}경기`:r.stale?'갱신 실패 · 이전 확인 자료':'연결 실패 · 재시도 필요'):'대기 중';const at=r?.checkedAt?new Date(r.checkedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';return `<div class="source-row"><a href="${t.source}" target="_blank" rel="noopener noreferrer">${t.name}</a><span title="${escapeHTML(r?.error||r?.scope||'')}" class="${r&&!r.ok&&!r.loading?'error':''}">${message}${at?`<small>${at} 확인</small>`:''}</span></div>`;}).join('');
}
async function loadMonth(force=false){const seq=++loadSequence;const key=`${year}-${pad(month+1)}`;events=loadedMonths.get(key)||[];statuses.clear();const sources=['daegu','barca','lotte','lol','vlr','f1'];sources.forEach(s=>statuses.set(s,{loading:true}));render();renderStatus();$('refresh').disabled=true;$('sync-label').textContent='최신 일정과 지난 경기 결과를 불러오는 중…';let merged=[];
 await Promise.all(sources.map(async source=>{let data;try{const r=await fetch(`/api/schedule?source=${source}&month=${key}${force?"&refresh=1":""}`,{signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error('서버 연결 실패');data=await r.json();if(!Array.isArray(data.events))throw Error('잘못된 응답');}catch(e){data={ok:false,events:[],error:e.message};}if(seq!==loadSequence)return;statuses.set(source,data);merged.push(...data.events);events=[...new Map(merged.map(e=>[e.id,e])).values()];render();renderStatus();}));
 if(seq!==loadSequence)return;loadedMonths.set(key,events);$('refresh').disabled=false;const failed=[...statuses.values()].filter(r=>!r.ok).length;$('sync-label').textContent=failed?`${failed}개 출처를 불러오지 못했습니다. 아래 연결 상태를 확인해 주세요.`:'최신 일정 확인 완료 · 열어 둔 동안 5분마다 갱신';
}
$('refresh').onclick=()=>loadMonth(true);$('month-picker').onchange=e=>{if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(e.target.value))return;[year,month]=e.target.value.split('-').map(Number);month--;selectedDay=null;render();loadMonth();};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadMonth();});setInterval(()=>{if(!document.hidden)loadMonth();},300000);loadMonth();
if(document.modelContext?.registerTool){try{document.modelContext.registerTool({name:'read_matchday_schedule',description:'현재 달의 팀별 경기 및 연결 상태를 조회합니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||Object.keys(input).length)throw Error('빈 객체를 입력하세요.');return {month:year+'-'+pad(month+1),events:events.filter(e=>active.has(e.team)),sources:Object.fromEntries(statuses)};}});}catch{}}
