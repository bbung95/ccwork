# Issue 4 — 태그 삭제

> AC·시나리오의 단일 출처(SSOT)는 이 파일이며, 상위 기획 맥락은 `issues.md` / `prd.md` 참조.

## 설명

`EditorTagChip`의 X 버튼을 클릭하면 해당 태그를 즉시 삭제한다. 확인 단계 없이 바로 제거되며, 마지막 태그 삭제 시 태그 영역 전체(`tag-area`)가 사라진다.

## 구현 범위

- `useTags`에 `removeTag(tag: string)` 액션 추가
- `EditorTagChip`에 X 버튼 추가 (`onRemove` prop 연결)
- X 버튼 스타일: `--ink-3`, hover 시 `--red-soft` 배경
- `NoteEditor`에서 `onRemove={() => removeTag(tag)}` 연결

## 시그니처

### 훅

```ts
// src/hooks/useTags.ts
function useTags(initialTags: string[]): {
  tags: string[];
  addTag: (input: string) => void;
  removeTag: (tag: string) => void; // 신규 — 정확히 일치하는 태그 제거
  setTags: (tags: string[]) => void;
};
```

무시 케이스 (throw 없음):

- `removeTag('nonexistent')` — 존재하지 않는 태그 → no-op (상태 불변)

> 정규화 여부: `addTag`이 이미 소문자로 정규화해 저장하므로, `removeTag`은 chip에서 넘어온 **저장된 값(정규화 완료)** 을 그대로 받아 일치 제거한다. 추가 정규화는 하지 않는다.

### 컴포넌트 Props

```ts
// src/components/EditorTagChip.tsx
interface EditorTagChipProps {
  label: string;
  onRemove: () => void; // 신규 — X 버튼 클릭 시 호출
}
```

- `TagChipBase` children으로 `label` + X 버튼(`<button>`)을 함께 전달
- X 버튼 스타일: `--ink-3`, hover 시 `--red-soft` 배경, 16×16px, r `11px`, 배경 투명 (TagChip.md 스펙)
- 클릭 시 `onRemove()` 즉시 호출 (확인 dialog 없음)
- `TagChipBase`는 변경하지 않는다 (children만 받는 순수 외형 컴포넌트)

### NoteEditor 연결

```tsx
<EditorTagChip key={tag} label={tag} onRemove={() => removeTag(tag)} />
```

### 타입 확장

- 없음 (`Note.tags`는 Issue 3에서 추가됨)

---

## 완료 조건 (Acceptance Criteria)

- [ ] chip의 X 버튼 클릭 → 해당 태그가 즉시 제거된다
- [ ] 확인 dialog 없이 바로 삭제된다
- [ ] 마지막 태그를 삭제하면 태그 영역 전체가 사라진다
- [ ] X 버튼 hover 시 `--red-soft` 배경이 적용된다

## 테스트 시나리오

### useTags

- [정상] `removeTag` — should remove the tag when an existing tag is given ✅
- [정상] `removeTag` — should remove only the matching tag and keep the others ✅
- [경계] `removeTag` — should result in empty array when removing the last remaining tag ✅
- [예외] `removeTag` — should be no-op when the tag does not exist ✅

### EditorTagChip

- [정상] `EditorTagChip` — should render the X (remove) button ✅
- [정상] `EditorTagChip` — should call onRemove when the X button is clicked ✅
- [정상] `EditorTagChip` — should call onRemove immediately without a confirm dialog ✅

### NoteEditor 통합

- [정상] `NoteEditor` — should remove the chip when its X button is clicked ✅
- [경계] `NoteEditor` — should hide the tag area entirely when the last tag is removed ✅
