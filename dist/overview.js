'use strict';
// 모아보기: one row per team — competition, standing, record, last five results, next match.
// Reuses the team-view record data (loadRecords/recordData) and the schedule already loaded for the calendar.
const overviewTab=$('overview-tab');
function overviewShown(){return !$('overview-view').hidden;}
function showOverview(){
 $('schedule-view').hidden=true;$('records-view').hidden=true;$('overview-view').hidden=false;
 $('schedule-tab').setAttribute('aria-pressed','false');$('records-tab').setAttribute('aria-pressed','false');overviewTab.setAttribute('aria-pressed','true');
 render();renderOverview();loadOverview();
}
function leaveOverview(){$('overview-view').hidden=true;overviewTab.setAttribute('aria-pressed','false');}
overviewTab.onclick=showOverview;
$('schedule-tab').onclick=()=>{leaveOverview();showView('schedule');};
$('records-tab').onclick=()=>{leaveOverview();showView('records');};
function openTeamView(team){leaveOverview();showView('records');selectRecordTeam(team);if(recordDetailView!=='records')selectRecordDetail('records');scrollTo(0,0);}
// While 모아보기 is open, the sidebar/team tabs open that team's page instead of filtering a hidden calendar.
const renderBeforeOverview=render;render=function(){renderBeforeOverview();if(overviewShown())document.querySelectorAll('#teams [data-team]').forEach(b=>{b.setAttribute('aria-pressed','true');b.onclick=()=>openTeamView(b.dataset.team);});};

let overviewLoading=false;
async function loadOverview(force=false){
 if(overviewLoading)return;overviewLoading=true;$('overview-status').textContent='기록 확인 중…';
 await Promise.all(teams.map(t=>Promise.resolve(loadRecords(t.id,force)).catch(()=>{}).then(()=>{if(overviewShown())renderOverview();})));
 // Next match outside the current month: look three months ahead only for teams that need it.
 await Promise.all(teams.filter(t=>!nextMatch(t.id)&&!['hle','blg','ns'].includes(t.id)).map(t=>Promise.resolve(loadTeamSchedule(t.id)).catch(()=>{})));
 overviewLoading=false;if(overviewShown())renderOverview();
}

const isUpcoming=e=>e.date>=today&&!['종료','취소','연기'].includes(e.status);
function nextMatch(team){
 const byTime=(a,b)=>(a.date+(a.time||'99:99')).localeCompare(b.date+(b.time||'99:99'));
 const fromMonth=events.filter(e=>e.team===team&&isUpcoming(e)).sort(byTime)[0];
 if(fromMonth)return fromMonth;
 return typeof teamScheduleRows==='function'?teamScheduleRows(team).filter(isUpcoming).sort(byTime)[0]||null:null;
}
function shortDay(date){const d=new Date(date+'T12:00:00+09:00');return (d.getMonth()+1)+'/'+d.getDate()+' ('+'일월화수목금토'[d.getDay()]+')';}
function nextText(team,c){
 const e=nextMatch(team);
 if(e){const mine=ownIndex(e),opp=e.participants?.length===2&&mine>=0?e.participants[1-mine].name:null;return `<strong>${shortDay(e.date)} ${e.time||'시간 미정'}</strong><span>${escapeHTML(koText(opp?'vs '+opp:e.title))}</span>`;}
 if(c?.mode==='progress'&&c.next)return `<span class="ov-muted">${escapeHTML(koText(c.next))}</span>`;
 return '<span class="ov-muted">예정된 경기 없음</span>';
}
function formChips(recent){
 if(!recent?.length)return '<span class="ov-muted">—</span>';
 return recent.slice(0,5).reverse().map(g=>`<span class="ov-form ${g.result==='승'?'win':g.result==='패'?'loss':'draw'}" title="${escapeHTML(g.date+' vs '+koText(g.opponent)+' '+g.score)}">${g.result}</span>`).join('');
}
function overviewRow(t){
 const data=recordData.get(t.id),c=data?.competitions?.[0];
 const logo=`<span class="team-sigil"><img src="/logos/${t.id}.${t.id==='f1'?'svg':'png'}" alt=""></span>`;
 let comp='',rank='',record='',form='';
 if(!c){comp=recordErrors.has(t.id)?'<span class="ov-muted">기록을 불러오지 못했어요</span>':'<span class="ov-muted">불러오는 중…</span>';}
 else if(t.id==='f1'){
  // F1 has no "own" team: show the constructors' leader up top and the drivers' leader below.
  const drivers=data.competitions.find(x=>x.id==='drivers')||c,teamsC=data.competitions.find(x=>x.id==='team'),d1=drivers.own,t1=teamsC?.own;
  comp=escapeHTML((String(c.name).match(/\d{4}/)||[''])[0]+' 시즌');
  // Phone: team leader top-right, driver leader bottom-left. PC: driver leader first, team leader after.
  const pc=s=>`<span class="only-pc">${s}</span>`,mo=s=>`<span class="only-mo">${s}</span>`;
  const teamTop=t1?`<strong>1위</strong> ${escapeHTML(koText(t1.name))}`:'—',teamPts=t1?.points!=null?t1.points+'점':'';
  const drvTop=d1?`<strong>1위</strong> ${escapeHTML(koText(d1.name))}`:'—',drvPts=d1?.points!=null?d1.points+'점':'';
  rank=mo(teamTop)+pc(drvTop);
  record=mo(teamPts)+pc(drvPts);
  form=mo(d1?`<span class="ov-f1">${drvTop} <span>${drvPts}</span></span>`:'—')+pc(t1?`<span class="ov-f1">${teamTop} <span>${teamPts}</span></span>`:'—');}
 else if(c.mode==='progress'){comp=escapeHTML(koText(c.name));rank=`<strong>${escapeHTML(koText(c.stage||''))}</strong>`;record=escapeHTML(c.record||'');form=formChips(c.recent);if(c.seasonOver){rank=`<strong>${escapeHTML(c.seasonOver.final||c.seasonOver.reason)}</strong>`;return rowHTML(t,logo,comp,rank,record,form,`<span class="ov-muted">${escapeHTML(c.seasonOver.year)} 시즌 종료</span>`);}}
 else{const off=recordOffSeason(t.id,c,false);comp=escapeHTML(koText(c.name));rank=`<strong>${c.own?.rank?(off?'최종 ':'')+c.own.rank+'위':'—'}</strong>`;record=escapeHTML(c.record||'');form=formChips(c.recent);if(off)return rowHTML(t,logo,comp,rank,record,form,`<span class="ov-muted">${escapeHTML(off)} 시즌 종료</span>`);}
 return rowHTML(t,logo,comp,rank,record,form,nextText(t.id,c));
}
function rowHTML(t,logo,comp,rank,record,form,next){
 return `<button class="ov-row" style="--color:${t.color}" data-overview-team="${t.id}" aria-label="${escapeHTML(t.name)} 자세히 보기"><span class="ov-team">${logo}<span>${escapeHTML(t.name)}</span></span><span class="ov-comp">${comp}</span><span class="ov-rank">${rank}</span><span class="ov-record">${record}</span><span class="ov-formbox">${form}</span><span class="ov-next">${next}</span></button>`;
}
function renderOverview(){
 const head='<div class="ov-row ov-head" aria-hidden="true"><span class="ov-team">팀</span><span class="ov-comp">대회</span><span class="ov-rank">순위·단계</span><span class="ov-record">성적</span><span class="ov-formbox">최근 5경기</span><span class="ov-next">다음 경기</span></div>';
 $('overview-body').innerHTML=head+teams.map(overviewRow).join('');
 document.querySelectorAll('[data-overview-team]').forEach(b=>b.onclick=()=>openTeamView(b.dataset.overviewTeam));
 fitLoadedLogos($('overview-body'));
 const times=teams.map(t=>recordData.get(t.id)?.checkedAt).filter(Boolean).sort();
 $('overview-status').textContent=overviewLoading?'기록 확인 중…':times.length?'마지막 확인 '+new Date(times[0]).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';
}
