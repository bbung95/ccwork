# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

React 19 + TypeScript + Vite 기반 노트 앱 실습 프로젝트. JSON Server를 mock 백엔드로 사용하며, 강의 진행에 따라 기능을 점진적으로 추가하는 구조.

## 주요 명령어

```bash
npm run dev          # 프론트(5173) + JSON Server(3001) 동시 실행
npm run server       # JSON Server만 단독 실행
npm run build        # tsc + vite build
npm run lint         # ESLint --fix
npm run format       # Prettier --write
npm test             # Vitest (단건 실행)
npm run test:watch   # Vitest (watch 모드)
```

## 아키텍처

### 상태 관리 흐름

```
App.tsx (selectedNoteId, isCreating)
  └─ NotesProvider (notes[], loading, error, createNote/updateNote/deleteNote)
       ├─ NoteList  ← 목록 표시, 선택 이벤트 emit
       └─ NoteEditor ← 선택된 노트 편집 / 새 노트 생성
```

- **App.tsx**: UI 선택 상태(어떤 노트가 선택됐는지, 생성 모드인지)만 관리. 비즈니스 로직 없음.
- **NotesContext**: 전역 노트 상태 + API 호출의 유일한 진입점. 낙관적 업데이트 없이 API 응답 후 상태 반영.
- **api/notes.ts**: fetch 기반 얇은 래퍼. `createdAt`/`updatedAt` 타임스탬프를 API 레이어에서 주입.

### 백엔드

- `db.json` — JSON Server의 데이터 파일 (git 추적 중)
- 엔드포인트: `http://localhost:3001/notes`
- `Note` 타입: `id | title | content | createdAt | updatedAt` (`tags`는 미구현, 강의에서 추가 예정)

## 기술 스택

| 항목      | 내용                                    |
| --------- | --------------------------------------- |
| UI        | React 19, Tailwind CSS v4               |
| 빌드      | Vite 6, TypeScript 5                    |
| 테스트    | Vitest + @testing-library/react (jsdom) |
| 린트/포맷 | ESLint 9 (flat config), Prettier 3      |
| Mock API  | json-server 1.x beta                    |

## 구현 패턴

### 컴포넌트

- **컴포넌트는 반드시 named export만 사용한다** (`export function Foo`, default export 금지)
- Props 인터페이스는 같은 파일에 `ComponentNameProps`로 정의
- 로딩/에러/빈 상태는 early return으로 처리 (guard clause 패턴)
- 순수 표현 컴포넌트(`NoteItem`)는 Context를 직접 사용하지 않고 props만 받음
- 레이아웃 슬롯은 `ReactNode` props로 주입 (`sidebar`, `main`)

### 상태 관리

- **전역**: `NotesContext` — 노트 데이터 + CRUD 액션
- **로컬**: 컴포넌트 내부 UI 상태 (`title`, `content`, `saving`)
- **App 레벨**: 컴포넌트 간 공유가 필요한 UI 상태 (`selectedNoteId`, `isCreating`)
- 낙관적 업데이트 없음 — API 응답 후 상태 반영
- 선택된 노트 변경 시 `useEffect`로 폼 동기화

### API 호출

- 컴포넌트는 `api/notes.ts`를 직접 호출하지 않음 — 반드시 `useNotes()` 액션을 통해 호출
- 비동기 액션은 `setSaving(true)` → `try/catch/finally` → `setSaving(false)` 패턴
- `createdAt` / `updatedAt` 타임스탬프는 `api/notes.ts` 레이어에서 주입 (컴포넌트·Context에서 직접 세팅 안 함)

### 네이밍

| 구분                      | 패턴           | 예시                                     |
| ------------------------- | -------------- | ---------------------------------------- |
| 컴포넌트 내 이벤트 핸들러 | `handle*`      | `handleSave`                             |
| 이벤트 핸들러 props       | `on*`          | `onSelect`, `onDone`                     |
| Context 액션              | 동사+명사      | `createNote`, `updateNote`, `deleteNote` |
| API 함수                  | 동사+명사      | `fetchNotes`, `createNote`, `deleteNote` |
| boolean 상태              | `is*` / `has*` | `isCreating`, `isSelected`               |
| 컴포넌트 파일             | PascalCase     | `NoteEditor.tsx`                         |
| 유틸·API 파일             | camelCase      | `notes.ts`                               |

## 알려진 패턴 불일치

- **`export default` 예외**: `src/components/` 파일은 named export만 사용하지만 `App.tsx`는 `export default App` 사용. 진입점 파일만 예외.
- **boolean 상태 네이밍 혼재**: `isCreating`, `isSelected`는 `is*` 접두사를 따르지만 `loading`(NotesContext), `saving`(NoteEditor)은 접두사 없이 사용. 새 boolean 상태 추가 시 기존 맥락을 따를 것.
- **에러 처리**: `alert()` 사용 금지. 유효성 실패는 `console.log`, API 에러는 `console.error`로 처리.

## 커밋 규칙

Conventional Commits 형식 필수. `git commit` 시 husky가 자동 검증.

```
<type>: 제목

본문 첫 번째 줄
본문 두 번째 줄
```

- **제목 필수** — `type: 제목` 형식 (type 없으면 차단)
- **본문 필수, 최소 1줄** — 빈 본문이면 차단
- **주요 type**: `feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `style`

## 주의사항

- Tailwind CSS v4는 `@tailwindcss/vite` 플러그인 방식으로 통합됨 (PostCSS 불필요)
- `useNotes()` 훅은 `NotesProvider` 외부에서 호출 시 에러 throw
- `Note.id`는 JSON Server가 자동 생성하므로 `createNote` 호출 시 전달 불필요
- 테스트 설정 파일: `src/test-setup.ts` (jest-dom matchers 등록)
