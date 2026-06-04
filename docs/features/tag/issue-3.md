# Issue 3 — 태그 추가 및 chip 표시

> issues.md 수직 슬라이스 #1에 해당. AC·시나리오의 단일 출처(SSOT)는 이 파일이며, 상위 기획 맥락은 `issues.md` / `prd.md` 참조.

## 설명

NoteEditor에서 태그를 입력하고 Enter를 누르면 `EditorTagChip`으로 표시되는 기능을 구현한다. 입력값은 `trim()` → `toLowerCase()`로 정규화되며, 중복 입력은 무시된다. chip 묶음 영역(`tag-area`)은 태그가 1개 이상일 때만 렌더링되고, 태그 입력 필드(`TagInput`)는 첫 태그 추가를 위해 **항상 노출**된다. 노트 전환 시 태그 상태가 새 노트에 맞게 동기화되며, 저장하지 않은 편집 중 태그는 유실된다.

## 구현 범위

- `Note` 타입에 `tags?: string[]` 추가 (optional — 기존 노트 호환, PRD ADR-4)
- `src/hooks/useTags.ts` — `tags` 상태, `addTag`(trim → toLowerCase → 중복 검사), `setTags`
- `src/components/TagChipBase.tsx` — 공유 칩 외형
- `src/components/EditorTagChip.tsx` — 태그 텍스트 표시 (X 버튼은 Issue 2)
- `src/components/TagInput.tsx` — `onKeyDown` Enter 핸들러, 입력 초기화
- `NoteEditor` — chip 영역 조건부 렌더링(`tags.length > 0`), 입력 필드 상시 노출, `selectedNote.tags ?? []` 방어적 읽기, `useEffect`에서 노트 전환 시 `setTags`, `TagInput`을 `key={selectedNoteId}`로 리마운트

## 시그니처

### 타입 확장

```ts
// src/types/note.ts
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[]; // optional — 기존 노트(tags 필드 없음) 호환, PRD ADR-4
}
```

### 훅

```ts
// src/hooks/useTags.ts
function useTags(initialTags: string[]): {
  tags: string[];
  addTag: (input: string) => void; // trim → toLowerCase → 중복 검사 후 추가
  setTags: (tags: string[]) => void; // 노트 전환 시 외부에서 전체 교체
};
```

에러/무시 케이스 (throw 없음):

- `addTag('')` — trim 후 빈 문자열 → no-op
- `addTag('   ')` — 공백만 → no-op
- `addTag('React')` when `'react'` 존재 → 중복 → no-op

### 컴포넌트 Props

```ts
// src/components/TagChipBase.tsx
interface TagChipBaseProps {
  children: ReactNode;
}

// src/components/EditorTagChip.tsx
interface EditorTagChipProps {
  label: string;
}

// src/components/TagInput.tsx
interface TagInputProps {
  onAdd: (value: string) => void;
}
// 노트 전환 시 NoteEditor에서 key={selectedNoteId}로 리마운트해 입력값 초기화
```

---

## 완료 조건 (Acceptance Criteria)

- [x] 태그 입력 후 Enter → chip이 추가된다
- [x] 앞뒤 공백 포함 입력 → trim 후 chip이 추가된다
- [x] 입력값은 소문자로 정규화되어 추가된다 (`React` → `react`)
- [x] 공백만 입력 후 Enter → 변화 없다
- [x] 이미 존재하는 태그와 동일한 값(대소문자 무시) 입력 → 무시된다
- [x] Enter 외 다른 키는 태그를 추가하지 않는다
- [x] 태그가 0개인 노트 → chip 묶음 영역(`tag-area`)이 렌더링되지 않는다
- [x] 태그가 0개여도 태그 입력 필드(`TagInput`)는 항상 노출된다 (첫 태그 추가용)
- [x] 태그가 1개 이상인 노트 → chip 묶음 영역이 렌더링된다
- [x] `tags` 필드가 없는 기존 노트를 열어도 런타임 에러가 발생하지 않는다
- [x] 다른 노트를 선택하면 이전 노트의 편집 중인 태그가 초기화되고 새 노트의 태그가 표시된다
- [x] 태그 있는 노트 → 태그 없는 노트로 전환 시 chip 묶음 영역 전체가 사라진다
- [x] 저장하지 않은 태그 변경사항(입력 중 + Enter로 추가한 것 모두)은 노트 전환 시 유실된다

> 모든 AC는 아래 테스트 시나리오로 검증됨 (18/18 통과). 체크 표시는 검증 완료를 의미한다.
> **범위 밖**: 태그 삭제(Issue 2), 10개 제한(Issue 3 슬라이스), Save 시 서버 저장(Issue 4), 20자 길이 제한(Issue 5).

## 테스트 시나리오

### useTags

- [정상] `useTags` — should return empty tags array when initialized with empty array ✅
- [정상] `addTag` — should add normalized tag when valid input is given ✅
- [정상] `addTag` — should apply trim and toLowerCase when input has surrounding spaces or uppercase ✅
- [정상] `setTags` — should replace all tags when called with new array ✅
- [경계] `addTag` — should be no-op when input is empty string ✅
- [경계] `addTag` — should be no-op when input is whitespace only ✅
- [예외] `addTag` — should be no-op when duplicate tag exists (case-insensitive) ✅

### TagInput

- [정상] `TagInput` — should call onAdd with input value when Enter key is pressed ✅
- [정상] `TagInput` — should clear input field after Enter key is pressed ✅
- [예외] `TagInput` — should not call onAdd when non-Enter key is pressed ✅

### NoteEditor 통합

- [정상] `NoteEditor` — should render tag area when note has one or more tags ✅
- [경계] `NoteEditor` — should not render tag area when note has no tags ✅
- [경계] `NoteEditor` — should not throw when note has no tags field (legacy note) ✅
- [정상] `NoteEditor` — should reset tags to new note's tags when selectedNote changes ✅
- [예외] `NoteEditor` — should discard unsaved tag changes when switching to another note ✅
- [경계] `NoteEditor` — should hide tag area entirely when switching from a tagged note to an untagged note ✅
- [정상] `NoteEditor` — should keep the tag input visible even when the note has no tags ✅
- [예외] `NoteEditor` — should discard an added-but-unsaved tag when switching notes ✅
