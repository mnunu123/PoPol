import type { Color } from './types';

/** 프로젝트별 Remotion 모션 씬 정의. 모든 수치는 site/data.mjs · 제작노트의 출처 기준. */
export type Visual =
  | { type: 'none' }
  | { type: 'pipeline'; nodes: string[] }
  | { type: 'scope' }
  | { type: 'bars'; items: [string, number][]; unit?: string; max?: number; caption?: string; invert?: boolean }
  | { type: 'mapdots' }
  | { type: 'blueprint' }
  | { type: 'boxes'; labels: string[] }
  | { type: 'grid6' }
  | { type: 'fsm'; states: string[]; caption?: string }
  | { type: 'checks'; items: [string, boolean][]; verdict: string };

export interface Stat { v: string; l: string; c?: Color }
export interface Chapter {
  id: string;
  label: string;
  dur: number; // frames @30fps
  title: string; // [[강조]] 마크업
  lines?: string[];
  visual?: Visual;
  stats?: Stat[];
  note?: string;
}
export interface SceneConfig { slug: string; kicker: string; title: string; accent: Color; chapters: Chapter[] }

export const FPS = 30;
export const sceneDuration = (s: SceneConfig) => s.chapters.reduce((a, c) => a + c.dur, 0);
export const chapterStarts = (s: SceneConfig) => {
  let t = 0;
  return s.chapters.map((c) => { const from = t; t += c.dur; return { ...c, from }; });
};

export const SCENES: SceneConfig[] = [
  {
    slug: 'threebot', kicker: '01 · THREE-BOT', title: '빗물받이 청소 로봇과 관제 플랫폼', accent: 'coral',
    chapters: [
      { id: 'problem', label: 'PROBLEM', dur: 95, title: '빗물받이 막힘은 [[민원이 들어오기 전에]] 먼저 알아야 했습니다',
        lines: ['막힘 → 우기 침수로 직결 · 현재는 사람이 순회 점검', '사각지대가 많고 예방적 관리가 안 됨', '"사진 한 장이 지금 청소가 필요한가"라는 판단으로'] },
      { id: 'structure', label: 'STRUCTURE', dur: 115, title: '현장 로봇부터 클라우드 관제까지 [[한 흐름]]으로 설계',
        visual: { type: 'pipeline', nodes: ['현장 로봇\nJetson Orin · STM32F407', '비전 · 계측\nYOLOv8-seg · ZED ×3', '데이터 플랫폼\nFastAPI · PostgreSQL', '분석 · 관제\n위험도 ML · Next.js 지도'] } },
      { id: 'reliability', label: 'RELIABILITY', dur: 120, title: '릴레이 노이즈 오동작 [[100% → 0%]] — 원인을 HW·SW 양쪽에서',
        lines: ['페라이트 코어 · 트위스트 배선 · 바이패스 커패시터 · 분리 배선', '디바운스 20ms 재확인 + CLOSE 입력 800ms 마스킹', '100회 반복 테스트 오동작 0건 · 2026.01.14'],
        visual: { type: 'scope' } },
      { id: 'scale', label: 'SCALE', dur: 105, title: '[[400만 건]]에서 멈추던 지도를 공간 인덱스 + 뷰포트 조회로',
        lines: ['원인: 매번 전체 데이터를 순회 조회', 'spatial index + BBOX 조회 + deck.gl 뷰포트 렌더링'],
        visual: { type: 'mapdots' } },
      { id: 'verify', label: 'VERIFY', dur: 120, title: '숫자는 [[재현 조건]]과 함께 적습니다',
        stats: [
          { v: '360h → 18h', l: '라벨링 소요 시간', c: 'coral' }, { v: '87.3%', l: 'mAP@50 · 10,000+장', c: 'violet' }, { v: '0 / 100', l: '오동작 · 반복 테스트', c: 'mint' },
          { v: '6,100만 원', l: '정부 R&D · 87.14% 집행', c: 'blue' }, { v: '9건', l: '수상 · 2025.09~12', c: 'amber' }, { v: '우수기업', l: '예창패 최종 선정', c: 'mint' },
        ] },
    ],
  },
  {
    slug: 'helmet', kicker: '02 · SAFETY VISION', title: '안전보호구 착용 모니터링', accent: 'mint',
    chapters: [
      { id: 'problem', label: 'PROBLEM', dur: 90, title: '"사람 수 vs 헬멧 수 비교"는 [[겹침과 가림]]에서 틀렸습니다',
        lines: ['사람이 겹치거나 가려지면 바로 오판', '근거리 사진 위주 학습 → 원거리 탐지 실패', '수천 장 크롤링 + 수작업 라벨링으로 보강'] },
      { id: 'detect', label: 'DETECTION', dur: 105, title: '머리와 입술을 [[직접 검출]]해 4클래스로 판정',
        visual: { type: 'boxes', labels: ['helmet', 'no_helmet', 'mask', 'no_mask'] } },
      { id: 'system', label: 'SYSTEM', dur: 105, title: '검출 결과가 [[알림과 경보]]까지 이어지게',
        visual: { type: 'pipeline', nodes: ['YOLOv8 검출\n25 epoch · 640', 'Flask 웹\nSQLite 로그 · 그래프', '알림\n카카오톡 · PDF', '엣지 경보\n라즈베리파이 LED · 부저'] } },
      { id: 'verify', label: 'VERIFY', dur: 100, title: '검증셋 기준으로만 적습니다',
        stats: [{ v: 'P 0.932', l: 'Precision · 검증셋', c: 'mint' }, { v: 'R 0.912', l: 'Recall · 검증셋', c: 'blue' }, { v: '2,548장', l: 'Train 1,871 / Valid 390 / Test 287', c: 'violet' }, { v: '1.9ms', l: '추론 · RTX A6000', c: 'coral' }],
      },
    ],
  },
  {
    slug: 'robotarm', kicker: '03 · PHYSICAL AI', title: '로봇팔 에이전트와 수거 VLA', accent: 'violet',
    chapters: [
      { id: 'problem', label: 'PREMISE', dur: 90, title: '"AI가 알아서 피하겠지"가 아니라 [[좌표계가 어긋날 수 있다]]는 전제로',
        lines: ['소프트웨어 좌표와 물리 위치가 어긋난 채 움직이면 충돌', '안전 상태를 시스템 차원에서 보장'] },
      { id: 'lock', label: 'SAFETY FSM', dur: 110, title: '부팅 시 [[Locked]] — 수동 홈 + reset_odometry 뒤에만 AI 제어 허용',
        visual: { type: 'fsm', states: ['Locked', '수동 홈', 'reset_odometry', 'Unlocked', 'Task'], caption: 'AI 모델 명령은 Locked 상태에서 전부 차단' } },
      { id: 'vla', label: 'VLA', dur: 105, title: '생활쓰레기 6종을 분할하고 [[Octo 4DoF]]로 수거 동작',
        visual: { type: 'pipeline', nodes: ['SAM2 커스텀\n쓰레기 6종 분할', 'ZED RGB+Depth\nC++ 포인트클라우드', 'Octo VLA\n6DoF → 4DoF 파인튜닝', '수거 동작\nSTM32 모터 명령'] } },
      { id: 'verify', label: 'VERIFY', dur: 95, title: '세 프로젝트에서 같은 원칙',
        stats: [{ v: '은상', l: '제5회 SDGs 소셜벤처 챔피언십', c: 'blue' }, { v: '4종', l: '책상 정리 · 책 배치 · 물 따르기 · 조명', c: 'violet' }, { v: '6종', l: 'SAM2 생활쓰레기 자동 분할', c: 'mint' }, { v: '3시점', l: 'wrist / overhead / side 궤적', c: 'coral' }] },
    ],
  },
  {
    slug: 'inmoov', kicker: '04 · INTERVIEW ROBOT', title: 'InMoov i2Head를 AI 인터페이스로', accent: 'coral',
    chapters: [
      { id: 'problem', label: 'DECISION', dur: 90, title: '"로봇처럼 보이는 것"보다 [["면접관처럼 느껴지는 것"]]에 집중',
        lines: ['서보 17개 전신 표정 → 눈 · 턱 · 목 · 눈썹 4부위만', '정밀도보다 타이밍 · 시선 · 발화 동기화'] },
      { id: 'state', label: 'STATES', dur: 100, title: '로봇 상태는 [[네 가지]]로만 전이합니다',
        visual: { type: 'fsm', states: ['Idle', 'Asking', 'Listening', 'Evaluating'], caption: '상태별 프리셋 모션 · listen_pose / nod_small / thinking_pose' } },
      { id: 'bridge', label: 'BRIDGE', dur: 105, title: 'AI 서버와 로봇 컨트롤러를 [[Bridge API]]로 분리 — 로봇 없이도 검증',
        visual: { type: 'pipeline', nodes: ['STT\nWhisper', 'LLM\nClaude', 'TTS · 평가\nFastAPI', 'Bridge API', '서보 컨트롤러\nArduino · PCA9685'] } },
      { id: 'verify', label: 'VERIFY', dur: 95, title: '리스크 큰 조립을 마지막에',
        stats: [{ v: '17 → 4', l: '서보 전체 표정 → 4부위', c: 'coral' }, { v: '13종', l: '프리셋 표정', c: 'violet' }, { v: '3단계', l: '텍스트 → 음성 → 실물', c: 'blue' }, { v: '1인', l: 'OPIc 음성 모의면접 MVP', c: 'mint' }] },
    ],
  },
  {
    slug: 'moodlight', kicker: '05 · GESTURE', title: '손동작 인식 스마트 무드등', accent: 'blue',
    chapters: [
      { id: 'problem', label: 'DESIGN', dur: 90, title: '좌표가 아니라 [[불변성을 갖는 관절 각도]]로 손동작을 분류',
        lines: ['카메라 거리·위치가 달라져도 "얼마나 굽었는가"는 불변', '손 모양이 아니라 동작(시간 패턴)을 분류'] },
      { id: 'pipeline', label: 'PIPELINE', dur: 115, title: '21관절 좌표 → 관절각 15개 → 30프레임 → Transformer',
        visual: { type: 'pipeline', nodes: ['MediaPipe\n관절 21개 좌표', '관절각 15개\narccos · 불변 특징', '30프레임 시퀀스', 'Transformer\nSelf-Attention 1블록', '확정 규칙\n3프레임 연속 일치'] } },
      { id: 'verify', label: 'VERIFY', dur: 105, title: '수집한 데이터로 검증한 수치',
        stats: [{ v: '4,010', l: '시퀀스 샘플 (30프레임 × 99차원)', c: 'blue' }, { v: '5종', l: 'red · green · blue · up · down', c: 'violet' }, { v: '100%', l: '자체 검증셋 정확도', c: 'mint' }, { v: '15개', l: '관절각 특징', c: 'coral' }],
      },
    ],
  },
  {
    slug: 'agents', kicker: '06 · AGENTS', title: 'AI 자동화 파이프라인 7개', accent: 'violet',
    chapters: [
      { id: 'problem', label: 'PRINCIPLE', dur: 90, title: 'AI 도구를 써본 것이 아니라 [[반복 작업을 자동화 구조로]] 바꿨습니다',
        lines: ['에이전트 하나가 모든 판단을 하지 않도록 파이프라인으로', '중간 산출물은 JSON으로 → 실패 단계만 재실행', '선택 이유를 데이터에 함께 기록'] },
      { id: 'pipeline', label: 'PIPELINE', dur: 115, title: '5개 에이전트가 협업해 [[13섹션 상세페이지]]를 3~5분에',
        visual: { type: 'pipeline', nodes: ['01 Intake\nHaiku', '02 Research\nSonnet', '03 Copy\nSonnet · 13섹션', '04 Design\nHaiku · 프리셋 주입', '05 Prompt\nGemini 이미지'] } },
      { id: 'gate', label: 'A/B GATE', dur: 115, title: 'A/B 승자는 [[신뢰할 조건]]을 전부 통과할 때만 선언',
        visual: { type: 'checks', items: [['전체 제출 ≥ 10', false], ['variant당 노출 ≥ 100', false], ['SRM 불균형 ≤ 20%', true], ['CVR 차이 ≥ 0.2%p', false]], verdict: 'collect_more' },
        lines: ['하나라도 못 넘으면 collect_more — 데이터를 더 모은 뒤 다시 판정'] },
      { id: 'verify', label: 'VERIFY', dur: 100, title: '수치는 GitHub · DEVLOG 기준',
        stats: [{ v: '3~5분', l: '13섹션 생성 (수작업 2~3일)', c: 'violet' }, { v: '7개', l: '파이프라인 · 저장소', c: 'blue' }, { v: 'R0~R7', l: 'PPT 설득 규칙 기계 검수', c: 'coral' }, { v: '30~60초', l: '쇼츠 레퍼런스 수집 1회', c: 'mint' }] },
    ],
  },
  {
    slug: 'kamp', kicker: '07 · MANUFACTURING DATA', title: 'KAMP 사출성형 검사 우선순위', accent: 'blue',
    chapters: [
      { id: 'problem', label: 'REFRAME', dur: 95, title: '"불량을 맞히지 말고, [[검사 순서를 정하자]]"',
        lines: ['불량률 0.96% → 검사 시간 99%가 양품 확인', '지도학습 분류기만으로는 구분이 어려움', '지표: 같은 검사량의 무작위 검사 대비 불량 포착률'] },
      { id: 'model', label: 'MODEL', dur: 110, title: '근거 셋을 [[로지스틱 회귀]]로 합치고, 최근 200개 순위로 등급',
        visual: { type: 'pipeline', nodes: ['근거 1\n공정 이상 · IsolationForest', '근거 2\n캐비티 위험 · 베이지안', '근거 3\n연속불량 · 감쇠 점수', '로지스틱 회귀', '등급\n정밀 10 / 표준 50 / 샘플 40'] } },
      { id: 'evidence', label: 'EVIDENCE', dur: 115, title: '[[세 근거를 결합]]해야 필요한 검사량이 내려갑니다',
        visual: { type: 'bars', items: [['캐비티만', 100], ['이상점수만', 83.8], ['캐비티 + 연속불량', 69.2], ['세 근거 결합', 62.6]], unit: '%', max: 100, caption: '불량 95% 포착에 필요한 검사량 · 작을수록 좋음', invert: true } },
      { id: 'verify', label: 'VERIFY', dur: 105, title: '검증은 4겹, [[뒤로 갈수록 엄격하게]]',
        stats: [{ v: '−32%', l: '검사 작업량 (1,000 → 682)', c: 'coral' }, { v: '25 / 25', l: '10월 날짜순 · 검사량 60.3%', c: 'violet' }, { v: '1.5~1.9배', l: '무작위 대비 포착률', c: 'blue' }, { v: '4겹', l: '세션 CV → 테스트일 → 날짜순 → 11월 봉인', c: 'mint' }],
      },
    ],
  },
  {
    slug: 'radar', kicker: '08 · LLM + RULES', title: '할증레이더', accent: 'mint',
    chapters: [
      { id: 'problem', label: 'IDEA', dur: 95, title: '선사 할증 공지를 LLM이 읽고, [[근거 구절이 원문과 일치할 때만]] 자동 반영',
        lines: ['1차 사용자: 중소 포워더 견적 담당자', 'AI 판단은 ② 추출뿐, 나머지는 규칙'] },
      { id: 'arch', label: 'ARCHITECTURE', dur: 115, title: '학습 없이 지시문만으로 — [[규칙이 AI를 검사]]합니다',
        visual: { type: 'pipeline', nodes: ['① 수집\n선사 7곳 · 80건 · 해시', '② LLM 추출\n24칸 · 근거 원문', '③ 규칙 검사\n근거 · 금액 · 날짜 · 약어', '④ 할증 DB', '⑤ 계산 엔진\n손계산 16건 통과'] } },
      { id: 'eval', label: 'EVALUATION', dur: 115, title: '정답셋 45건을 직접 만들어 [[추출기 3종을 같은 잣대]]로',
        visual: { type: 'bars', items: [['정규식', 2.7], ['Haiku 4.5', 66.3], ['Sonnet 5.5', 95.2]], unit: '%', max: 100, caption: 'test 294 레코드 정확도 (8 · 195 · 280 / 294)' } },
      { id: 'verify', label: 'VERIFY', dur: 100, title: '같은 잣대로 잰 결과',
        stats: [{ v: '95.2%', l: '추출 정확도 · 280 / 294', c: 'mint' }, { v: '98.2%', l: '자동 승인 정확도 · 223 / 227', c: 'blue' }, { v: '22.8%', l: '사람 확인으로 넘긴 비율', c: 'violet' }, { v: '22초', l: '공지 1건 추출 중앙값', c: 'coral' }],
      },
    ],
  },
  {
    slug: 'software', kicker: '09 · SOFTWARE', title: '같은 원칙, 다른 도메인', accent: 'blue',
    chapters: [
      { id: 'problem', label: 'PRINCIPLE', dur: 95, title: '바뀔 부분은 [[어댑터로 분리]], 분기가 늘어날 로직은 [[상태 기반]]',
        lines: ['"프로토타입이니까 대충"이 아니라 바뀔 경계를 코드 구조에', 'README에 "구현 완료 / 다음 단계" 구분'] },
      { id: 'state', label: 'STATE', dur: 105, title: '부족한 값을 임의로 채우지 않고 [[상태를 명시적으로 반환]]',
        visual: { type: 'fsm', states: ['missing_data', 'invalid_age', 'ready', 'judgeStatus', '대안 3개'], caption: 'Spendable · core 순수 함수 · Vitest 13개' } },
      { id: 'three', label: 'THREE PROJECTS', dur: 105, title: '핀테크 · Unity 오목 AI · 산불 CCTV MSA',
        visual: { type: 'pipeline', nodes: ['Spendable\nNext.js 16 · Zustand', 'badok\nUnity 6 · 미니맥스 · Task.Run', '산불 CCTV\n5 MSA · YOLOv8 · 광류'] } },
      { id: 'verify', label: 'VERIFY', dur: 95, title: '설계가 맞았다는 증거',
        stats: [{ v: '13', l: 'Vitest 유닛 테스트', c: 'blue' }, { v: '0줄', l: '2D → 3D 전환 시 로직 수정', c: 'violet' }, { v: '5', l: '마이크로서비스', c: 'coral' }, { v: '3건', l: 'DEVLOG 재현 · 검증 버그', c: 'mint' }] },
    ],
  },
  {
    slug: 'pv5', kicker: '10 · PBV PACKAGE', title: 'PV5 카고 택배 패키지', accent: 'amber',
    chapters: [
      { id: 'problem', label: 'IDEA', dur: 95, title: '뒷문을 열면 [[꺼낼 상자가 있는 칸에 불이 켜진다]] — 카메라도 버튼도 없이',
        lines: ['주차 P + 목적지 반경 + 도어 열림 세 신호로 판단', '판단은 앱이, 짐칸 모듈은 불만 켠다'] },
      { id: 'grid', label: 'LOAD ZONES', dur: 115, title: '3단 × 2열 [[6칸]] — 도착하면 그 집 상자 칸만',
        visual: { type: 'grid6' } },
      { id: 'elec', label: 'ELECTRICAL', dur: 105, title: '차량 12V 하나로 도는 LED 60개, 표시창, 경고음',
        visual: { type: 'pipeline', nodes: ['차량 12V\n퓨즈 5A', 'DC-DC\n5V 3A', '74AHCT125\n5V 로직', 'WS2812B ×60\n구역당 10', 'OLED · 부저\nNPN 구동'] } },
      { id: 'verify', label: 'VERIFY', dur: 95, title: '제안서 18p + A3 도면 3장 + 앱 화면 시안',
        stats: [{ v: '6칸', l: '한 칸 약 752 × 783mm', c: 'amber' }, { v: '60개', l: 'WS2812B · 밝기 상한 60%', c: 'coral' }, { v: '7종', l: 'BLE JSON 메시지', c: 'violet' }, { v: '14종', l: '범용 부품 BOM', c: 'mint' }],
      },
    ],
  },
  {
    slug: 'drainx', kicker: '11 · CAD DESIGN', title: 'DRAIN-X 2035 준설 로봇', accent: 'amber',
    chapters: [
      { id: 'problem', label: 'REQUIREMENTS', dur: 95, title: '쓰리봇 MVP에서 부딪힌 문제가 그대로 [[설계 요구사항]]이 됐습니다',
        lines: ['사람이 밀어 정렬 → 보도 자율 주행 + 측면 650mm', '±5mm 그리퍼 → EPM 패드', '시간 판단 윈치 → 엔코더 + 로드셀', '건식 흡입 → 클램셸 + 배수'] },
      { id: 'blueprint', label: 'MECHANISM', dur: 130, title: '보도에 선 채 [[650mm]] 뻗고, [[1,950mm]] 내려간다',
        visual: { type: 'blueprint' } },
      { id: 'process', label: 'AX PROCESS', dur: 105, title: 'AI가 탐색하고, [[사람이 결정]]하고, ZYXCAD AX가 그린다',
        visual: { type: 'pipeline', nodes: ['DISCOVER\n요강 · 기록 5종', 'DIVERGE\n아이디어 10개', 'DECIDE\n100점 평가', 'ENGINEER\nPython 계산', 'DESIGN\nZYXCAD AX', 'REVIEW\nLISP 재검증'] } },
      { id: 'verify', label: 'VERIFY', dur: 95, title: '모든 치수는 계산값과 대조',
        stats: [{ v: '6장', l: '조립도 · 부품도 · 상세도 · 구조도', c: 'amber' }, { v: '650mm', l: '보도에서 차도 쪽 리치', c: 'coral' }, { v: '162°', l: '덮개 플리퍼 스윙', c: 'violet' }, { v: '1,950mm', l: 'Z 집체인 스트로크', c: 'blue' }],
      },
    ],
  },
  {
    slug: 'docs', kicker: '12 · DOCUMENTS', title: '숫자가 틀리면 안 되는 문서', accent: 'violet',
    chapters: [
      { id: 'problem', label: 'PRINCIPLE', dur: 90, title: '숫자가 틀리면 안 되는 도메인에서는 [["왜 믿어도 되는지"]]를 먼저 설계',
        lines: ['기술을 만드는 것과 문서로 번역하는 것은 다른 일', '지식재산융합전공 · 특허와 사업화 문서 직접 작성'] },
      { id: 'model', label: 'REITS MODEL', dur: 110, title: '청년임대 리츠 — 자본 미스매치 진단에서 [[몬테카를로 5,000회]]까지',
        visual: { type: 'pipeline', nodes: ['진단\n자산 IRR 3.57% < 국채 4.37%', '구조\n인허가 단계 리츠 매입 약정', '모델\n세대당 20년 현금흐름', '시뮬레이션\n5,000회 · 400회', '비교\nA / B / B′ / C'] } },
      { id: 'verify', label: 'VERIFY', dur: 100, title: '리츠 모델이 낸 결과',
        stats: [{ v: '−56%', l: '세대당 기금 소요 2.06 → 0.91억', c: 'violet' }, { v: '2.3배', l: '기금 1조 원당 지원 세대', c: 'blue' }, { v: '2건', l: '배터리 특허 초안 L-Fin · V-Pack', c: 'coral' }, { v: '45p', l: '기술 · 기업 · 특허 동향 보고서', c: 'mint' }] },
    ],
  },
  {
    slug: 'video', kicker: '13 · AI VIDEO', title: '"모여서 만든 길" 56초', accent: 'amber',
    chapters: [
      { id: 'problem', label: 'START', dur: 85, title: '영상 제작 경험 없이 혼자, 도구 6개를 [[역할 분담]]해 56초를',
        lines: ['"56주년" 한 숫자 → 개미가 작은 걸음을 모아 길을 만든다', '개미 클로즈업 → 56년 전 건설 현장 → 현재의 고속도로'] },
      { id: 'pipeline', label: 'PIPELINE', dur: 115, title: '각 도구가 잘하는 영역이 다르다 — [[장면별로 역할을 미리]] 정했습니다',
        visual: { type: 'pipeline', nodes: ['GPT-4\n스토리보드 · 프롬프트', '미드저니\n개미 · 건설 현장', 'Kling · Veo3\n이미지→움직임 · 드론샷', '다빈치 리졸브\n편집 · 컬러 그레이딩', '수퍼톤\n내레이션 · AI 음악'] } },
      { id: 'verify', label: 'VERIFY', dur: 95, title: '같은 파이프라인을 코레일 캠페인에 재사용',
        stats: [{ v: '대상', l: '한국도로공사 56주년 · 2025.10', c: 'amber' }, { v: '56초', l: '1280 × 720 · 24fps', c: 'coral' }, { v: '6개', l: 'AI 도구 역할 분담', c: 'violet' }, { v: '2편', l: '코레일 철도건널목 캠페인', c: 'mint' }] },
    ],
  },
  {
    slug: 'design', kicker: '14 · AI CRAFT', title: '디자인 · 웹툰 공모전', accent: 'coral',
    chapters: [
      { id: 'problem', label: 'METHOD', dur: 85, title: '콘셉트 · 대사 · 규격은 직접, [[생성은 AI]]',
        lines: ['기획 의도 · 금지 사항(과장 수치 · 로고 · 악당화)을 지시문으로 고정', '선행 컷을 참조 이미지로 넘겨 화풍 연속성 유지'] },
      { id: 'pipeline', label: 'WORKFLOW', dur: 110, title: '같은 운용 방식을 [[디자인 영역]]으로',
        visual: { type: 'pipeline', nodes: ['기획 의도', '스토리보드 · 대사', '규격 · 금지 사항\n지시문', 'AI 생성\nGPT · 미드저니', '검수 · 재생성\n말풍선 · 오류'] } },
      { id: 'verify', label: 'VERIFY', dur: 100, title: '판타지아 대구 AI 페스타 카드뉴스 [[대상]]',
        stats: [{ v: '대상', l: '판타지아 대구 AI 페스타 · 2026.10', c: 'amber' }, { v: '18건', l: 'Works 갤러리 작품', c: 'coral' }, { v: '7편', l: '웹툰 · 인스타툰', c: 'violet' }, { v: '3건', l: '하나카드 plate 상세페이지', c: 'mint' }] },
    ],
  },
];

export const sceneOf = (slug: string) => SCENES.find((s) => s.slug === slug);

/** 홈 히어로 쇼릴 — 4트랙 요약 */
export const SHOWREEL: SceneConfig = {
  slug: 'showreel', kicker: 'SEJUN PARK · PORTFOLIO 2026', title: 'Build & Verify', accent: 'mint',
  chapters: [
    { id: 'threebot', label: '01 · THREE-BOT', dur: 150, title: '전장 · 펌웨어 · 비전 · 관제를 [[한 사람이 관통]]한 기록',
      visual: { type: 'pipeline', nodes: ['현장 로봇', '비전 · 계측', '데이터 플랫폼', '분석 · 관제'] },
      stats: [{ v: '100% → 0%', l: '릴레이 오동작 · 100회', c: 'mint' }, { v: '400만 건', l: '지도 · 뷰포트 조회', c: 'coral' }] },
    { id: 'vision', label: '02 · VISION & ROBOTICS', dur: 150, title: '학습에서 끝내지 않고 [[현장에서 작동하는]] 모델',
      visual: { type: 'boxes', labels: ['helmet', 'no_helmet', 'mask'] },
      stats: [{ v: 'P 0.932', l: 'Precision · 검증셋', c: 'mint' }, { v: 'R 0.912', l: 'Recall · 검증셋', c: 'blue' }] },
    { id: 'ai', label: '03 · AI & DATA', dur: 150, title: '판단을 자동화하기 전에 [[판단의 기준]]을 먼저',
      visual: { type: 'bars', items: [['캐비티만', 100], ['이상점수만', 83.8], ['캐비티 + 연속', 69.2], ['세 근거 결합', 62.6]], unit: '%', max: 100, caption: '불량 95% 포착에 필요한 검사량', invert: true },
      stats: [{ v: '−32%', l: '검사 작업량 · KAMP', c: 'blue' }, { v: '25 / 25', l: '날짜순 검증 포착', c: 'violet' }] },
    { id: 'design', label: '04 · DESIGN & CRAFT', dur: 150, title: '기술을 [[도면과 문서]]로 번역',
      visual: { type: 'blueprint' },
      stats: [{ v: '6장', l: 'DRAIN-X 도면', c: 'amber' }, { v: '대상 2', l: '카드뉴스 · AI 영상', c: 'coral' }] },
  ],
};
