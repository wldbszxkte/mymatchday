import {arraysForKey,textOnly,vlrUpcomingLinks,parseVlrMatch} from './sources.mjs';
async function read(url,options={}){const r=await fetch(url,{...options,headers:{'User-Agent':'Mozilla/5.0',...options.headers},signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('대회 출처 응답 '+r.status);return r.text();}
const clean=s=>textOnly(s||'');
export function stageLabel(value){const raw=clean(value);const map={'Upper Quarterfinals':'승자조 8강','Upper Semifinals':'승자조 4강','Upper Final':'승자조 결승','Grand Final':'최종 결승','Quarterfinals':'8강','Semifinals':'4강','Finals':'결승','Group Stage':'조별리그','Playoffs':'플레이오프','Swiss Stage':'스위스 스테이지','Play-In':'플레이인','Regular Season':'정규시즌','UBQF':'승자조 8강','UBSF':'승자조 4강','UBF':'승자조 결승','GF':'최종 결승','Decider':'진출 결정전','Opening':'첫 경기','Elim':'탈락 결정전'};let result=raw;for(const [a,b] of Object.entries(map))result=result.replaceAll(a,b)
result=result.replace(/\bLR(\d)\b/g,'패자조 $1라운드').replace(/\bUR(\d)\b/g,'승자조 $1라운드').replace(/\bLBF\b/g,'패자조 결승');return result||'단계 미공개';}
function recentSummary(recent){const wins=recent.filter(g=>g.result==='승').length,losses=recent.filter(g=>g.result==='패').length;return `${wins}승 ${losses}패`;}
export function selectLolProgress(events,id,now=Date.now()){const mine=events.filter(e=>e.matchTeams?.some(t=>t.id?.endsWith(':'+id))).sort((a,b)=>a.startTime.localeCompare(b.startTime));const current=mine.find(e=>e.state==='inProgress')||mine.find(e=>e.state!=='completed'&&Date.parse(e.startTime)>=now);const past=mine.filter(e=>e.state==='completed'&&Date.parse(e.startTime)<=now).reverse();const focus=current||past[0];if(!focus)throw Error('응원팀 대회 정보 미공개');const name=[focus.league?.name,focus.tournament?.name].filter(Boolean).join(' · ');const recent=past.slice(0,5).map(e=>{const own=e.matchTeams.find(t=>t.id.endsWith(':'+id)),other=e.matchTeams.find(t=>t!==own);return {date:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date(e.startTime)),opponent:other.code||other.name,score:own.result.gameWins+' : '+other.result.gameWins,result:own.result.outcome==='win'?'승':'패',competition:e.league?.name+' · '+e.tournament?.name,stage:stageLabel(e.blockName)};});const other=focus.matchTeams.find(t=>!t.id.endsWith(':'+id));const seasonOver=lolSeasonOver(events,id,current,past,now);return {competitions:[{id:'progress',name,mode:'progress',seasonOver,rankLabel:current?'현재 참가 대회':'최근 참가 대회',stage:stageLabel(focus.blockName),stageLabel:current?'예정·진행 경기 단계':'마지막 완료 경기 단계',next:current?`${other.code||other.name} · ${new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(focus.startTime))} KST`:'다음 대진 미공개',recent,record:recentSummary(recent),rows:[],source:'https://lolesports.com/ko-KR/',note:current?'단계는 다음 또는 진행 중인 경기의 공식 표기입니다.':'다음 대진이 확인되지 않아 마지막 완료 경기의 대회와 단계를 표시합니다. 최근 5경기는 대회 전체 기준입니다.'}]};}

// ── Season end for esports ──
// LoL's season ends with Worlds, VALORANT's with Champions. A team is "season over" when it has no upcoming match and
// either the championship has finished and the team has not played since, or the championship is under way without it.
// Final placement from the team's last match of the championship: finals → 우승/준우승, otherwise "<stage> 탈락".
export function finalPlacement(stage,result){const s=String(stage||'').trim();if(!s)return null;if(/결승$/.test(s)&&!/승자조|패자조/.test(s))return result==='승'?'우승':'준우승';return result==='패'?s+' 탈락':s}
const kstYear=t=>Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date(t)))
export function lolSeasonOver(events,id,current,past,now=Date.now()){
 if(current)return null
 const worlds=events.filter(e=>e.league?.slug==='worlds'&&e.startTime).sort((a,b)=>a.startTime.localeCompare(b.startTime))
 const season=[...new Set(worlds.map(e=>kstYear(e.startTime)))].filter(y=>y<=kstYear(now)).sort().at(-1)
 if(!season)return null
 const ws=worlds.filter(e=>kstYear(e.startTime)===season)
 const isFinal=e=>/결승|final/i.test(e.blockName||'')&&!/준결승|semi/i.test(e.blockName||'')
 const final=ws.filter(isFinal).at(-1)
 const finished=!!final&&ws.every(e=>e.state==='completed')
 const started=ws.some(e=>e.state&&e.state!=='unstarted')
 const teamIn=ws.some(e=>e.matchTeams?.some(t=>t.id?.endsWith(':'+id)))
 const lastPlayed=past[0]?Date.parse(past[0].startTime):0
 const lastWorlds=ws.filter(e=>e.state==='completed'&&e.matchTeams?.some(t=>t.id?.endsWith(':'+id))).at(-1),own=lastWorlds?.matchTeams.find(t=>t.id?.endsWith(':'+id))
 const placement=lastWorlds?finalPlacement(stageLabel(lastWorlds.blockName),own?.result?.outcome==='win'?'승':'패'):null
 if(finished&&lastPlayed<=Date.parse(final.startTime)+86400000)return {year:String(season),event:'월즈',final:teamIn?placement:null,reason:teamIn?'월즈 종료':'월즈 미진출'}
 if(started&&!finished&&!teamIn&&lastPlayed<Date.parse(ws[0].startTime))return {year:String(season),event:'월즈',final:null,reason:'월즈 미진출'}
 return null
}
const MONTHS={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}
export function parseChampionsEvents(html){
 const out=[]
 for(const m of html.matchAll(/<a\b[^>]*class="wf-card mod-flex event-item"[^>]*href="\/event\/\d+\/valorant-champions-(\d{4})"[\s\S]*?event-item-desc-item-status mod-(\w+)[\s\S]*?mod-dates">\s*([^<]+)/g)){
  const year=Number(m[1]),parts=m[3].trim().split(/\s*[—–-]\s*/),day=s=>{const x=s.match(/([A-Z][a-z]{2})\s+(\d{1,2})/);return x&&x[1] in MONTHS?Date.UTC(year,MONTHS[x[1]],Number(x[2])):null}
  out.push({year,status:m[2],start:day(parts[0]),end:day(parts.at(-1))})
 }
 return out
}
let championsCache=null
async function championsEvents(){if(championsCache&&Date.now()-championsCache.at<3600000)return championsCache.list
 const list=parseChampionsEvents(await read('https://www.vlr.gg/events/?tier=60'))
 championsCache={at:Date.now(),list};return list}
export function vctSeasonOver(champions,recent,hasUpcoming,now=Date.now()){
 if(hasUpcoming)return null
 const c=champions.filter(x=>x.year<=kstYear(now)&&x.status!=='upcoming').sort((a,b)=>b.year-a.year)[0]
 if(!c)return null
 const teamIn=recent.some(g=>/Champions/i.test(g.competition||'')&&String(g.competition).includes(String(c.year)))
 const lastPlayed=recent[0]?.date?Date.parse(recent[0].date+'T12:00:00Z'):0
 const placement=teamIn?finalPlacement(recent[0]?.stage,recent[0]?.result):null
 if(c.status==='completed'&&c.end&&lastPlayed<=c.end+86400000)return {year:String(c.year),event:'챔피언스',final:placement,reason:teamIn?'챔피언스 종료':'챔피언스 미진출'}
 if(c.status==='ongoing'&&!teamIn&&c.start&&lastPlayed<c.start)return {year:String(c.year),event:'챔피언스',final:null,reason:'챔피언스 미진출'}
 return null
}

let lolPending=null,lolCached=null;
async function lolEvents(){if(lolCached&&Date.now()-lolCached.at<900000)return lolCached;if(lolPending)return lolPending;lolPending=(async()=>{const html=await read('https://lolesports.com/ko-KR/'),all=arraysForKey(html,'teamGPR').flat();const ids={hle:'100205573496804586',blg:'99566404853854212'};const leagues=[...new Set(all.filter(x=>Object.values(ids).includes(x.team.id)).flatMap(x=>x.tournaments.map(t=>t.tournament.league.id)))];if(!leagues.length)throw Error('LoL 대회 목록 조회 실패');const now=new Date(),from=new Date(now);from.setUTCMonth(from.getUTCMonth()-3);const to=new Date(now);to.setUTCMonth(to.getUTCMonth()+4);const payload={operationName:'homeEvents',extensions:{persistedQuery:{version:1,sha256Hash:'7246add6f577cf30b304e651bf9e25fc6a41fe49aeafb0754c16b5778060fc0a'}},variables:{hl:'ko-KR',sport:['lol'],eventType:'match',pageSize:300,eventDateStart:from.toISOString(),eventDateEnd:to.toISOString()}};const events=[],seen=new Set();for(let page=0;page<30;page++){const j=JSON.parse(await read('https://lolesports.com/api/gql',{method:'POST',headers:{'Content-Type':'application/json','apollographql-client-name':'Matchday','apollographql-client-version':'1.0'},body:JSON.stringify(payload)}));if(j.errors||!Array.isArray(j.data?.esports?.events))throw Error('LoL 단계 조회 실패');events.push(...j.data.esports.events);const token=j.data.esports.pages?.newer;if(!token||!j.data.esports.events.length)break;if(seen.has(token)||page===29)throw Error('LoL 대회 페이지 조회 실패');seen.add(token);payload.variables.pageToken=token;}return lolCached={at:Date.now(),events,ids};})().finally(()=>lolPending=null);return lolPending;}
export async function esportsProgress(team){if(team!=='ns'){const data=await lolEvents();return selectLolProgress(data.events,data.ids[team]);}const source='https://www.vlr.gg/team/11060/nongshim-redforce',overview=await read(source),upcoming=vlrUpcomingLinks(overview);const history=await read(source.replace('/team/','/team/matches/')+'/');const cards=[...history.matchAll(/<a\s+href="([^"]+)"\s+class="wf-card fc-flex m-item"[^>]*>([\s\S]*?)<\/a>/g)];const recent=cards.map(([,url,c])=>{const names=[...c.matchAll(/class="m-item-team-name">([\s\S]*?)<\/span>/g)].map(m=>clean(m[1])),score=clean(c.match(/class="m-item-result[^"]*"[^>]*>([\s\S]*?)<i /)?.[1]).match(/(\d+)\s*:\s*(\d+)/),idx=names.findIndex(n=>/Nongshim/i.test(n));if(idx<0||!score)return null;const a=Number(score[idx+1]),b=Number(score[2-idx]),event=c.match(/class="m-item-event[^>]*>[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>([\s\S]*?)<\/div>/);return {date:c.match(/(\d{4}\/\d{2}\/\d{2})/)?.[1]?.replaceAll('/','-'),opponent:names[1-idx],score:a+' : '+b,result:a>b?'승':'패',competition:clean(event?.[1]),stage:stageLabel(event?.[2])};}).filter(Boolean).slice(0,5);const url=upcoming[0]|| (cards[0]?'https://www.vlr.gg'+cards[0][1]:null);if(!url)throw Error('농심 대회 미공개');const html=await read(url),header=html.match(/<a\b[^>]*href="([^"]+)"[^>]*class="match-header-event"[^>]*>([\s\S]*?)<\/a>/)?.[2];if(!header)throw Error('농심 대회 단계 형식 변경');const name=clean(header.match(/font-weight:\s*700[^>]*>([\s\S]*?)<\/div>/)?.[1]),stage=stageLabel(header.match(/class="match-header-event-series"[^>]*>([\s\S]*?)<\/div>/)?.[1]);const match=upcoming.length?parseVlrMatch(html,url):null;const opponent=match?.participants.find(p=>!/Nongshim/i.test(p.name));let seasonOver=null;try{seasonOver=vctSeasonOver(await championsEvents(),recent,!!match)}catch{};return {competitions:[{id:'progress',name,mode:'progress',seasonOver,rankLabel:match?'현재 참가 대회':'최근 참가 대회',stage,stageLabel:match?'예정 경기 단계':'마지막 완료 경기 단계',next:match?`${opponent?.name||'상대 미정'} · ${match.date} ${match.time||'시간 미정'} KST`:'다음 대진 미공개',recent,record:recentSummary(recent),rows:[],source:url,note:'단계는 VLR 경기 페이지의 표기입니다. 최근 5경기는 대회 전체 기준입니다.'}]};}

