# 매치데이 v4
농심 예정 경기 수집 수정 및 홈 화면 아이콘 추가. 캘린더 추가 기능은 없습니다.

일정 수집 함수도 함께 배포해야 합니다. 정적 ZIP 드래그 업로드만으로 함수 수정이 반영된다고 보장할 수 없습니다.

Git 연결 사이트: 이 폴더 내용을 저장소에 반영 후 재배포하세요.
수동 사이트: Node.js 설치 후 ZIP을 풀고 해당 폴더의 터미널에서 실행하세요.

npx netlify-cli login
npx netlify-cli link
npx netlify-cli deploy --prod --dir=dist --functions=netlify/functions

link에서 기존 사이트를 선택하면 기존 주소를 유지합니다.
배포 후 새로고침하세요. 일정 캐시는 몇 분 유지될 수 있습니다.
기존 홈 화면 바로가기를 삭제하고 다시 추가하면 새 아이콘을 가져옵니다.

검증: 수집기 제목의 대소문자/공백 변형 및 과거 결과 분리, JS 구문, PNG 파일 확인.
실제 VLR 직접 접속 테스트는 로컬 네트워크 접속 실패로 확인하지 못했습니다. 운영 배포는 수행하지 않았습니다.

## v5 변경
경기별 양 팀 로고를 일정 출처의 팀 정보에서 자동으로 가져옵니다.
축구·야구: 네이버 homeTeamEmblemUrl / awayTeamEmblemUrl
LoL: LoL Esports matchTeams.image
발로란트: VLR 경기 상세 페이지의 match-header-link 이미지
상대 변경 시 다음 일정 갱신에서 로고도 함께 바뀝니다. F1은 기존 F1 로고를 유지합니다.
상대 미정 또는 출처 이미지 누락/접속 실패 시 팀 이름을 표시합니다.
새로고침 버튼은 이전 일정 캐시를 건너뛰고 다시 조회합니다.

저장된 출처 응답 검증: 롯데 9경기, 대구 3경기, 바르셀로나 3경기, LoL 7경기, VLR 1경기 모두 양 팀 로고 주소 확인.
라이브 외부 이미지 로딩 및 운영 사이트 반영은 아직 확인하지 않았습니다.

GitHub 업로드: ZIP을 풀고 dist, netlify, sources.mjs, netlify.toml을 저장소 루트에 올리세요. ZIP 자체를 업로드하지 마세요.
Netlify Git 연동: Build command 비움, Publish directory dist, Functions directory netlify/functions.
`n v6: VLR 과거 경기 팀/로고/점수 순서를 기록 목록 순서로 통일했습니다. 역순 상세 페이지 및 승패 점수 회귀 검증 통과.
