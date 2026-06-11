# Issue 13 — 태그 필터 칩 목록 표시

> 참조: `docs/features/filter/prd.md` (ADR-1, ADR-3, ADR-5), `docs/design-system/components/TagChip.md`
> 범위: 이번 이슈는 `allTags` 파생과 칩 목록 표시까지. 선택/필터링/초기화/빈상태는 #14~#16.

## 시그니처

### 훅 — `src/hooks/useFilter.ts`

```ts
// notes의 모든 태그 합집합(중복 제거)을 파생해 반환한다.
// Note.tags는 optional이므로 없는 경우 빈 배열로 처리한다.
// notes가 비거나 어떤 노트에도 태그가 없으면 allTags === []
function useFilter(notes: Note[]): {
  allTags: string[];
};
// 파생식: notes.flatMap(n => n.tags ?? []) 의 중복 제거
```

### 컴포넌트 Props — `src/components/FilterTagChip.tsx`

```ts
// TagChipBase 기반, 이번 이슈에서는 클릭/선택 동작 없는 기본 칩 (선택 상태는 #14)
interface FilterTagChipProps {
  label: string;
}
```

### 컴포넌트 Props — `src/components/TagFilter.tsx`

```ts
// 순수 표현 컴포넌트 — props로 받은 태그 목록을 FilterTagChip으로 렌더링.
// tags가 빈 배열이면 null 반환 (영역 자체가 렌더링되지 않음).
interface TagFilterProps {
  tags: string[];
}
```

### 기존 파일 변경 — `src/components/NoteList.tsx`

```ts
// 시그니처 변경 없음 (props 동일: selectedNoteId, onSelect)
// 내부에서 useFilter(notes)로 allTags를 구해 목록 상단에 <TagFilter tags={allTags} /> 렌더링.
// 이번 이슈에서 목록 자체의 필터링은 하지 않는다 (notes 그대로 표시) — 필터링은 #14.
```

## 테스트 시나리오

### useFilter

- [정상] useFilter — should return the union of all note tags when multiple notes have tags ✅
- [정상] useFilter — should deduplicate a tag shared by multiple notes ✅
- [정상] useFilter — should recompute allTags when notes change so a removed note's exclusive tag disappears ✅
- [경계] useFilter — should return an empty array when notes is empty ✅
- [경계] useFilter — should return an empty array when no note has tags (undefined or empty tags) ✅

### FilterTagChip

- [정상] FilterTagChip — should render the given label text ✅

### TagFilter

- [정상] TagFilter — should render one chip per tag ✅
- [경계] TagFilter — should render nothing when tags is empty ✅

### NoteList

- [정상] NoteList — should render TagFilter with tag chips when notes have tags ✅
- [경계] NoteList — should not render TagFilter when no note has tags ✅
- [정상] NoteList — should render TagFilter above the note items in DOM order ✅ (AC 검증 보강)
- [정상] NoteList — should remove a tag chip after the note exclusively owning that tag is deleted ✅ (AC 검증 보강)

## AC 커버리지

| AC 항목                                                                 | 커버하는 시나리오                                                                                                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 태그가 있는 노트가 하나라도 있으면 TagFilter가 NoteList 상단에 표시된다 | [정상] NoteList — render TagFilter when notes have tags · [정상] NoteList — TagFilter above note items (DOM 순서) · [정상] TagFilter — one chip per tag |
| 칩 목록은 전체 노트의 태그 합집합이다 (중복 제거)                       | [정상] useFilter — union of all note tags · [정상] useFilter — deduplicate shared tag                                                                   |
| 전체 노트에 태그가 하나도 없으면 TagFilter 영역이 렌더링되지 않는다     | [경계] TagFilter — render nothing when tags empty · [경계] NoteList — not render TagFilter when no tags · [경계] useFilter — empty array when no tags   |
| 특정 태그를 가진 노트를 모두 삭제하면 해당 태그 칩이 자동으로 사라진다  | [정상] useFilter — recompute allTags when notes change (파생 검증) · [정상] NoteList — remove chip after exclusive note deleted (통합 경로)             |
