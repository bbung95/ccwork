# Issue 14 — 태그 선택 및 OR 필터링

> 참조: `docs/features/filter/prd.md` (ADR-1, ADR-2 OR조건, ADR-4 세션유지), `docs/design-system/components/TagChip.md` (FilterTagChip selected)
> 범위: 칩 선택/해제 토글 + OR 필터링까지. 필터 초기화 버튼은 #15, 필터 빈 상태 메시지는 #16.
> 전제: #13(allTags·칩 목록 표시) 머지 완료.

## 시그니처

### 훅 — `src/hooks/useFilter.ts` (확장)

```ts
function useFilter(notes: Note[]): {
  allTags: string[]; // (#13) 전체 태그 합집합
  selectedTags: string[]; // 현재 선택된 태그, 초기 []
  toggleTag: (tag: string) => void; // 미선택이면 추가, 선택돼 있으면 제거
  filteredNotes: Note[]; // selectedTags 비면 전체, 아니면 OR 매칭
};
// filteredNotes = selectedTags.length === 0
//   ? notes
//   : notes.filter(n => n.tags?.some(t => selectedTags.includes(t)))
// selectedTags는 useState로 보관 → 새로고침 시 소실(=초기화), 컴포넌트 생존 중엔 유지
```

### 컴포넌트 Props — `src/components/FilterTagChip.tsx` (확장)

```ts
interface FilterTagChipProps {
  label: string;
  selected: boolean; // 디자인: --blue-soft 배경 / --blue 텍스트
  onToggle: () => void; // 클릭 시 호출 (부모가 tag 바인딩 — EditorTagChip onRemove 패턴)
}
// 토글 버튼: <button type="button" aria-pressed={selected} onClick={onToggle}>
// 선택 상태를 aria-pressed로 노출
```

### 컴포넌트 Props — `src/components/TagFilter.tsx` (확장)

```ts
interface TagFilterProps {
  tags: string[]; // allTags
  selectedTags: string[]; // 선택된 태그 (칩별 selected 판정)
  onToggleTag: (tag: string) => void; // 칩 클릭 → 해당 tag 토글
}
```

### 기존 파일 변경 — `src/components/NoteList.tsx`

```ts
// useFilter에서 selectedTags, toggleTag, filteredNotes 추가 구조분해.
// 목록을 notes 대신 filteredNotes로 렌더링, 개수도 filteredNotes 기준.
// <TagFilter tags={allTags} selectedTags={selectedTags} onToggleTag={toggleTag} />
// (필터 결과 0건일 때의 "일치하는 노트 없음" 메시지는 #16 몫 — 이번엔 빈 목록만)
```

## 테스트 시나리오

### useFilter

- [정상] toggleTag — should add a tag to selectedTags when it is not selected ✅
- [정상] toggleTag — should remove a tag from selectedTags when it is already selected ✅
- [경계] selectedTags — should be empty initially ✅
- [정상] filteredNotes — should return all notes when selectedTags is empty ✅
- [정상] filteredNotes — should return only notes containing the selected tag when one tag is selected ✅
- [정상] filteredNotes — should return notes matching ANY selected tag (OR) when multiple tags are selected ✅
- [경계] filteredNotes — should exclude untagged notes when a tag is selected ✅
- [정상] useFilter — should keep selectedTags and recompute filteredNotes when a new non-matching note is added ✅

### FilterTagChip

- [정상] FilterTagChip — should call onToggle when clicked ✅
- [정상] FilterTagChip — should expose aria-pressed true when selected ✅
- [경계] FilterTagChip — should expose aria-pressed false when not selected ✅
- [정상] FilterTagChip — should apply blue selected styles when selected ✅ (AC 검증 보강)
- [경계] FilterTagChip — should apply muted styles when not selected ✅ (AC 검증 보강)

### TagFilter

- [정상] TagFilter — should mark a chip as selected (aria-pressed) when its tag is in selectedTags ✅
- [정상] TagFilter — should call onToggleTag with the tag when a chip is clicked ✅

### NoteList

- [정상] NoteList — should render only notes matching the selected tag after a chip is clicked ✅
- [정상] NoteList — should render all notes again after the selected chip is clicked off ✅
- [정상] NoteList — should keep the filter selection when selectedNoteId changes ✅

## AC 커버리지

| AC 항목                                     | 커버하는 시나리오                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 칩 클릭 → 선택 스타일 + 목록 즉시 갱신      | [정상] FilterTagChip onToggle/aria-pressed true · [정상] toggleTag add · [정상] NoteList render only matching |
| 선택 칩 재클릭 → 해제 + 갱신                | [정상] toggleTag remove · [정상] NoteList render all again                                                    |
| 2개 이상 선택 시 OR 필터링                  | [정상] filteredNotes OR (multiple)                                                                            |
| 선택 없으면 전체 표시                       | [정상] filteredNotes all when empty · [경계] selectedTags empty initially                                     |
| 노트 클릭해도 필터 유지                     | [정상] NoteList keep selection when selectedNoteId changes                                                    |
| 새로고침하면 필터 초기화                    | [경계] selectedTags empty initially (마운트=초기화) · 실제 새로고침은 E2E                                     |
| 필터 중 새 노트 생성 → 유지 + 미충족 미표시 | [정상] useFilter keep selection & recompute with new non-matching note                                        |
