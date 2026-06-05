# 검색 기능 이슈 목록

## 의존성

| #   | 이슈                                   | 의존 |
| --- | -------------------------------------- | ---- |
| 1   | 기본 검색 동작 구현 (Walking Skeleton) | —    |
| 2   | 빈 상태 처리 및 엣지 케이스 강화       | #1   |

---

## Issue 1: 기본 검색 동작 구현 (Walking Skeleton)

### 설명

검색 기능의 핵심 흐름을 end-to-end로 구현한다.
`useSearchNotes` 훅, `SearchBar` 컴포넌트, NoteList 연동, App.tsx 상태 연결을 한 번에 묶어
"검색창에 입력하면 노트가 필터링된다"는 동작이 사용자에게 보이는 상태로 완성한다.

구현 범위:

- `src/hooks/useSearchNotes.ts` — `(notes: Note[], query: string) => Note[]` 훅. title + content OR 조건, case-insensitive 비교
- `src/components/SearchBar.tsx` — `query`, `onQueryChange` props를 받는 controlled input 컴포넌트
- `NoteList.tsx` — `query` prop 추가, 내부에서 `useSearchNotes` 호출해 filteredNotes 렌더링
- `App.tsx` — `query` state 추가, 사이드바 슬롯에 `SearchBar` + `NoteList` 조합 주입
- `src/hooks/useSearchNotes.test.ts` — 훅 단위 테스트

### 완료 조건 (Acceptance Criteria)

- [ ] Given 노트 목록이 있을 때, When 검색창에 노트 제목 일부를 입력하면, Then 해당 노트만 목록에 표시된다
- [ ] Given 노트 목록이 있을 때, When 검색창에 본문에만 있는 단어를 입력하면, Then 해당 노트만 목록에 표시된다
- [ ] Given 검색어가 입력된 상태에서, When 검색창을 비우면, Then 전체 노트 목록이 표시된다
- [ ] Given 검색어를 대문자로 입력할 때, When 노트 제목이 소문자이면, Then 대소문자 무시하고 매칭된다
- [ ] `useSearchNotes` 훅 단위 테스트가 모두 통과한다

### 시나리오

**Scenario 1 — 제목 검색**
Given: 노트 목록에 "React 공부", "TypeScript 정리" 두 개가 있다
When: 검색창에 "react" 입력
Then: "React 공부" 노트만 목록에 표시된다 (case-insensitive)

**Scenario 2 — 본문 검색**
Given: "오늘 할 일" 제목, "useEffect 정리가 필요하다" 본문인 노트가 있다
When: 검색창에 "useEffect" 입력
Then: 해당 노트가 목록에 표시된다

**Scenario 3 — 검색어 초기화**
Given: 검색창에 "react"가 입력된 상태
When: 검색창을 완전히 비운다
Then: 전체 노트 목록으로 복귀한다

---

## Issue 2: 빈 상태 처리 및 엣지 케이스 강화

### 설명

Issue 1에서 구현한 기본 동작을 프로덕션 수준으로 완성한다.
검색 결과 0건일 때의 빈 상태 메시지, 공백 입력 처리, 검색 중 선택 상태 유지를 구현한다.

구현 범위:

- `NoteList.tsx` — 빈 상태를 두 가지로 분기: `query` 없을 때 "노트가 없습니다" / `query` 있고 결과 0건일 때 "검색 결과가 없습니다"
- `useSearchNotes.ts` — `query.trim()` 적용: 공백만 입력 시 전체 목록 반환
- 검색 중 노트 선택 후 검색어 변경 시 에디터 선택 상태 유지 확인 (기존 App.tsx 구조상 이미 보장되지만 테스트로 명시)

### 완료 조건 (Acceptance Criteria)

- [ ] Given 검색어가 없을 때, When 노트가 한 건도 없으면, Then "노트가 없습니다" 메시지가 표시된다
- [ ] Given 검색어를 입력했을 때, When 일치하는 노트가 없으면, Then "검색 결과가 없습니다" 메시지가 표시된다
- [ ] Given 공백만 입력했을 때, When trim 처리하면, Then 전체 노트 목록이 표시된다
- [ ] Given 노트를 선택한 상태에서, When 검색어를 변경해 해당 노트가 목록에서 사라져도, Then 에디터에 선택된 노트가 그대로 표시된다

### 시나리오

**Scenario 1 — 검색 결과 없음**
Given: "React 공부" 노트만 있다
When: 검색창에 "Vue" 입력
Then: 노트 목록 영역에 "검색 결과가 없습니다" 표시, "노트가 없습니다" 메시지는 표시되지 않는다

**Scenario 2 — 공백 입력**
Given: 노트가 3건 있다
When: 검색창에 " " (공백 3개) 입력
Then: 전체 3건의 노트 목록이 그대로 표시된다

**Scenario 3 — 선택 상태 유지**
Given: "React 공부" 노트를 선택해 에디터에 열려 있다
When: 검색창에 "Vue"를 입력해 "React 공부"가 목록에서 사라진다
Then: 에디터에는 "React 공부" 노트가 그대로 표시된다
