# Issue 5 — 태그 10개 제한

> AC·시나리오의 단일 출처(SSOT)는 이 파일이며, 상위 기획 맥락은 `issues.md` / `prd.md` 참조.

## 설명

태그가 10개에 도달하면 `TagInput` 입력 필드를 `disabled` 처리해 더 이상 추가할 수 없게 한다. X 버튼을 통한 삭제는 10개 상태에서도 가능하며, 삭제 후 10개 미만이 되면 입력 필드가 다시 활성화된다.

## 구현 범위

- `useTags`에 `MAX_TAGS = 10` 상수 정의 및 export
- `useTags.addTag`에서 `tags.length >= MAX_TAGS`이면 early return
- `TagInput`에 `disabled` prop 추가 + disabled 시각 스타일
- `NoteEditor`에서 `disabled={tags.length >= MAX_TAGS}` 전달

## 시그니처

### 상수

```ts
// src/hooks/useTags.ts
export const MAX_TAGS = 10;
```

> `addTag` 가드와 `NoteEditor`의 `disabled` 판정 양쪽에서 참조해 매직넘버 중복을 피한다.

### 훅

```ts
// src/hooks/useTags.ts
function useTags(initialTags: string[]): {
  tags: string[];
  addTag: (input: string) => void; // tags.length >= MAX_TAGS면 early return 추가
  removeTag: (tag: string) => void;
  setTags: (tags: string[]) => void;
};
```

추가 무시 케이스 (throw 없음):

- `addTag(...)` when `tags.length === 10` → 정원 초과 → no-op

### 컴포넌트 Props

```ts
// src/components/TagInput.tsx
interface TagInputProps {
  onAdd: (value: string) => void;
  disabled?: boolean; // 신규 — true면 <input disabled>, Enter로도 추가 불가
}
```

- `disabled`일 때 `<input disabled>` 처리 + disabled 시각 스타일
- disabled 상태에서는 native input이 keydown을 받지 못해 Enter 동작 안 함 (+ `addTag` 가드로 이중 방어)

### NoteEditor 연결

```tsx
<TagInput key={selectedNoteId} onAdd={addTag} disabled={tags.length >= MAX_TAGS} />
```

### 타입 확장

- 없음

---

## 완료 조건 (Acceptance Criteria)

- [ ] 태그가 10개 미만일 때 입력 필드가 활성화되어 있다
- [ ] 태그가 10개에 도달하면 입력 필드가 `disabled` 상태가 된다
- [ ] `disabled` 상태에서도 X 버튼으로 태그 삭제가 가능하다
- [ ] 태그를 삭제해 9개가 되면 입력 필드가 다시 활성화된다
- [ ] `disabled` 상태에서 Enter를 눌러도 태그가 추가되지 않는다

## 테스트 시나리오

### useTags

- [경계] `addTag` — should add the tag when there are 9 tags (just under the limit) ✅
- [예외] `addTag` — should be no-op when tags already has 10 tags (limit reached) ✅
- [정상] `addTag` — should allow adding again after removeTag drops the count below the limit ✅

### TagInput

- [정상] `TagInput` — should enable the input when disabled prop is not given ✅
- [경계] `TagInput` — should disable the input when disabled prop is true ✅
- [예외] `TagInput` — should not call onAdd on Enter when disabled is true ✅

### NoteEditor 통합

- [정상] `NoteEditor` — should keep the tag input enabled when the note has fewer than 10 tags ✅
- [경계] `NoteEditor` — should disable the tag input when the note has 10 tags ✅
- [정상] `NoteEditor` — should still allow removing a tag via X button when 10 tags are reached ✅
- [정상] `NoteEditor` — should re-enable the tag input after removing a tag from a 10-tag note ✅
