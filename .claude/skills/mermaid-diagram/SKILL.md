---
name: mermaid-diagram
description: Analyzes a React/TypeScript project's src/ directory and generates Mermaid architecture diagrams (component tree, import dependencies, state flow, data flow) as an interactive HTML file at docs/architecture/index.html, then opens it in the browser. Use this skill whenever someone asks to visualize, diagram, or document the project architecture, component relationships, data flow, or state management — even with vague phrasing like "show me the structure", "how are components connected", "diagram this codebase", "아키텍처 시각화", "컴포넌트 구조", "의존성 그래프", "구조 보여줘". Trigger for any request to understand or document how a React/TypeScript codebase is organized.
---

# mermaid-diagram

`src/` 디렉토리를 분석하여 Mermaid 기반 아키텍처 시각화 HTML을 생성하고 `docs/architecture/index.html`에 저장한다.

## 실행 단계

### 1. 소스 파악

```bash
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | sort
```

파일 목록 확인 후 **모든 파일을 Read 툴로 읽는다**. `src/`가 없으면 사용자에게 알리고 중단.

### 2. 관계 추출

각 파일에서 아래를 파악한다:

| 항목 | 방법 |
|------|------|
| Import 관계 | `import ... from` → 파일 간 의존 방향 |
| Props 인터페이스 | `interface *Props` → 컴포넌트 간 데이터 전달 |
| Context 소비 | `useContext` / 커스텀 훅 호출 위치 |
| 상태 소유 | `useState` / `useReducer` → 소유 레벨 |
| 슬롯 props | `ReactNode` 타입 props → 렌더링 슬롯 구조 |
| API 호출 | Context 경유 여부 vs 직접 호출 |

### 3. 다이어그램 4종 작성

**다이어그램 1 — 컴포넌트 트리** (`flowchart TD`)
렌더링 계층 구조. `ReactNode` 슬롯 props는 점선 화살표(`-.->`)와 `|"slot prop"|` 레이블로 표현.

**다이어그램 2 — Import 의존성** (`flowchart LR`)
파일 간 import 방향. `A --> B` = "A가 B를 import".

**다이어그램 3 — 상태 흐름** (`flowchart TD`)
`subgraph`로 상태 소유 레벨을 구분:
- App 레벨 상태 (UI 선택 상태)
- Context 전역 상태 (데이터 + 액션)
- 컴포넌트 로컬 상태

Props 전달은 실선(`-->`), Context 소비(훅 호출)는 점선(`-.->`)으로 구분.

**다이어그램 4 — 데이터 흐름** (`flowchart TD`)
API 호출 전체 체인: 컴포넌트 → Context 액션 → api 레이어 함수 → 외부 서버(HTTP). 각 화살표에 동작 레이블 표기. 컴포넌트가 api 레이어를 직접 호출하지 않는 설계 원칙이 드러나도록 표현.

### 4. 노드 스타일 (모든 다이어그램 일관 적용)

`style` 디렉티브로 레이어별 색상 지정:

| 레이어 | fill | stroke |
|--------|------|--------|
| 진입점/App | #dbeafe | #3b82f6 |
| Context/Provider | #dcfce7 | #22c55e |
| Layout | #fef3c7 | #f59e0b |
| 컨텐츠 컴포넌트 | #ede9fe | #8b5cf6 |
| 순수 표현 컴포넌트 | #fce7f3 | #ec4899 |
| API 레이어 함수 | #ffedd5 | #f97316 |
| 외부 서버 | #fef3c7 | #f59e0b |
| 타입 정의 | #f1f5f9 | #64748b |

### 5. HTML 파일 생성

포함 요소:
- **Mermaid CDN**: `https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js`
- **탭 UI**: 4개 버튼으로 다이어그램 전환 (기본: 첫 번째 탭 활성)
- **헤더**: 프로젝트명(`package.json` `name` 필드, 없으면 디렉토리명) + 생성 날짜
- **테마 토글**: 다크/라이트 전환 버튼, `localStorage`에 설정 저장, 변경 시 `location.reload()`로 Mermaid 재렌더링
- **범례**: 다이어그램마다 노드 색상과 화살표 의미 설명
- **반응형**: `overflow-x: auto`로 좁은 뷰포트 대응

레이블과 화살표 주석은 한국어. 노드 레이블에 괄호·슬래시 등 특수문자가 있으면 `["..."]`로 감싼다.

### 6. 저장 및 실행

```bash
mkdir -p docs/architecture
```

Write 툴로 `docs/architecture/index.html` 저장 후:

```bash
open docs/architecture/index.html
```

## 엣지 케이스

- `src/` 없음 → 사용자에게 알리고 중단
- `.tsx`/`.ts` 파일 없음 → 사용자에게 알리고 중단
- `package.json` 없음 → 디렉토리명을 프로젝트명으로 사용
- 파일 30개 이상 → 핵심 컴포넌트만 포함, 나머지는 "외부 모듈"로 그룹화
