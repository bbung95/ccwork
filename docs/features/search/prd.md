# 검색 기능 PRD

## 개요

노트 목록을 실시간으로 필터링하는 클라이언트 사이드 검색 기능.
검색어를 사이드바 상단 입력창에 입력하면 title + content 기준으로 노트 목록이 즉시 좁혀진다.

## 사용자 스토리

| #   | 역할   | 행동                                                           | 기대 결과                                                      |
| --- | ------ | -------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | 사용자 | 검색창에 단어를 입력한다                                       | title 또는 content에 해당 단어가 포함된 노트만 목록에 표시된다 |
| 2   | 사용자 | 검색창을 비운다                                                | 전체 노트 목록이 다시 표시된다                                 |
| 3   | 사용자 | 공백만 입력한다                                                | 전체 노트 목록이 표시된다 (trim 처리)                          |
| 4   | 사용자 | 일치하는 노트가 없는 검색어를 입력한다                         | "검색 결과가 없습니다" 메시지가 표시된다                       |
| 5   | 사용자 | 검색 중 노트를 선택하고 검색어를 변경해 목록에서 사라지게 한다 | 에디터의 선택 상태는 유지된다                                  |

## 기술 결정

### ADR-1: query 상태 관리 위치

- **Context** — `selectedNoteId`, `isCreating`처럼 컴포넌트 간 공유가 필요한 UI 상태를 App.tsx에서 관리하는 기존 패턴이 있다. `query` 역시 SearchBar와 NoteList 양쪽에서 필요한 UI 상태다.
- **Decision** — `query` 상태를 App.tsx에서 `useState`로 관리. `useSearchNotes(notes, query)` 훅을 NoteList 내부에서 호출해 filteredNotes를 구성. SearchBar는 `query`와 `onQueryChange` prop을 받음.
- **Alternatives**
  - B안(NotesContext에 query 추가): Context가 현재 "노트 데이터 + CRUD"만 담당한다는 원칙에 위배. UI 필터 상태가 데이터 레이어로 혼입됨 → 거부.
  - C안(SearchableNoteList 컴포넌트 캡슐화): 관심사 응집도는 높으나 App.tsx에서 query 접근 불가, 향후 URL 파라미터 등 확장 시 상태 끌어올리기 리팩터 필요 → 거부.
- **Consequences**
  - (+) CLAUDE.md의 App.tsx = UI 상태 관리 원칙과 완전히 일치
  - (+) `useSearchNotes` 훅을 독립적으로 단위 테스트 가능
  - (+) Context 변경 없음 — 기존 CRUD 흐름 영향 없음
  - (-) App.tsx 사이드바 슬롯이 `<NoteList>` 단일에서 `<SearchBar> + <NoteList>` 조합으로 변경됨
  - (-) NoteList에 `query` prop이 추가됨 (기존 props 인터페이스 변경)

### ADR-2: debounce 적용 여부

- **Context** — 클라이언트 사이드 `Array.filter()`는 수백 건 규모에서 매 키 입력마다 실행해도 성능 문제 없음. debounce는 API 호출 횟수를 줄이기 위한 최적화.
- **Decision** — 현재는 debounce 미적용. 매 키 입력마다 즉시 필터링.
- **Alternatives**
  - debounce 적용: 현 상황에서 불필요한 복잡도 추가 → 거부.
- **Consequences**
  - (+) 구현 단순, 즉각적인 UX
  - (-) 추후 서버사이드 API 검색으로 전환 시 debounce를 추가해야 함 (전환 시점에 `useSearchNotes` 훅 내부만 수정하면 됨)

## Out of Scope

- URL 쿼리 파라미터 연동 (`?q=검색어`)
- 서버사이드 필터링 (JSON Server `?q=` 파라미터 사용)
- 검색 결과 하이라이팅 (매칭 텍스트 강조)
- 태그 검색 (`tags` 필드 미구현)
- 검색 히스토리

## 용어 정의

| 용어           | 정의                                                            |
| -------------- | --------------------------------------------------------------- |
| query          | 사용자가 검색창에 입력한 문자열. trim 후 사용.                  |
| filteredNotes  | query를 title·content에 적용해 걸러낸 노트 배열                 |
| SearchBar      | query 입력창 컴포넌트 (`query`, `onQueryChange` props)          |
| useSearchNotes | `(notes: Note[], query: string) => Note[]` 시그니처의 커스텀 훅 |
