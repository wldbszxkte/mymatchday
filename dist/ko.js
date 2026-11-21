'use strict';
// Korean display names for competitions, venues and race names that sources send in English.
const KO_PHRASES=[
 // Football competitions
 ['UEFA Champions League','챔피언스리그'],['Champions League','챔피언스리그'],['La Liga','라리가'],['LaLiga','라리가'],['Copa del Rey','코파 델 레이'],['Supercopa de España','수페르코파'],['Supercopa','수페르코파'],['Club Friendly','친선경기'],['Friendly','친선경기'],['Joan Gamper Trophy','감페르 트로피'],
 // Esports
 ['Esports World Cup','e스포츠 월드컵'],['First Stand','퍼스트 스탠드'],['KeSPA Cup','KeSPA컵'],['Valorant Champions','발로란트 챔피언스'],['VALORANT','발로란트'],['Champions 2026','챔피언스 2026'],['Lower Round','패자조 라운드'],['Upper Round','승자조 라운드'],['Lower Final','패자조 결승'],['Upper Final','승자조 결승'],['Grand Final','결승'],
 // Formula 1 Grand Prix
 ['Abu Dhabi Grand Prix','아부다비 그랑프리'],['Australian Grand Prix','호주 그랑프리'],['Austrian Grand Prix','오스트리아 그랑프리'],['Azerbaijan Grand Prix','아제르바이잔 그랑프리'],['Bahrain Grand Prix','바레인 그랑프리'],['Barcelona Grand Prix','바르셀로나 그랑프리'],['Belgian Grand Prix','벨기에 그랑프리'],['British Grand Prix','영국 그랑프리'],['Canadian Grand Prix','캐나다 그랑프리'],['Chinese Grand Prix','중국 그랑프리'],['Dutch Grand Prix','네덜란드 그랑프리'],['Emilia Romagna Grand Prix','에밀리아 로마냐 그랑프리'],['Hungarian Grand Prix','헝가리 그랑프리'],['Italian Grand Prix','이탈리아 그랑프리'],['Japanese Grand Prix','일본 그랑프리'],['Las Vegas Grand Prix','라스베이거스 그랑프리'],['Mexico City Grand Prix','멕시코시티 그랑프리'],['Miami Grand Prix','마이애미 그랑프리'],['Monaco Grand Prix','모나코 그랑프리'],['Qatar Grand Prix','카타르 그랑프리'],['Saudi Arabian Grand Prix','사우디아라비아 그랑프리'],['Singapore Grand Prix','싱가포르 그랑프리'],['Spanish Grand Prix','스페인 그랑프리'],['São Paulo Grand Prix','상파울루 그랑프리'],['United States Grand Prix','미국 그랑프리'],['Madrid Grand Prix','마드리드 그랑프리'],
];
// Whole-value matches only (F1 circuit cities), so ordinary words are never touched.
const KO_EXACT={'Austin':'오스틴','Baku':'바쿠','Barcelona':'바르셀로나','Budapest':'부다페스트','Kuala Lumpur':'쿠알라룸푸르','Las Vegas':'라스베이거스','Lusail':'루사일','Madrid':'마드리드','Marina Bay':'마리나 베이','Melbourne':'멜버른','Mexico City':'멕시코시티','Miami Gardens':'마이애미','Monte Carlo':'몬테카를로','Montréal':'몬트리올','Monza':'몬차','Shanghai':'상하이','Silverstone':'실버스톤','Spa-Francorchamps':'스파','Spielberg':'슈필베르크','Suzuka':'스즈카','São Paulo':'상파울루','Yas Marina':'야스 마리나','Zandvoort':'잔드보르트','Jeddah':'제다','Sakhir':'사키르','Imola':'이몰라','Imola ':'이몰라','VLR.gg':'VLR'};
function koText(value){
 let s=String(value??'');if(!s)return s;
 if(KO_EXACT[s.trim()])return KO_EXACT[s.trim()];
 for(const [en,ko] of KO_PHRASES)if(s.includes(en))s=s.split(en).join(ko);
 return s.split(' · ').map(part=>KO_EXACT[part.trim()]||part).join(' · ');
}
