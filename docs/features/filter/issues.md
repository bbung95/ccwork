# 필터 기능 이슈 목록

> 참조: `docs/features/filter/prd.md`, `docs/design-system/components/TagChip.md`
> 수직 슬라이싱 원칙에 따라 분해. 각 이슈는 사용자에게 보이는 변화를 독립적으로 전달한다.
> 전제 조건: 태그 기능 Issue 1(Note 타입 확장 + TagChipBase)이 완료된 상태.

| #   | 이슈                   | 의존         |
| --- | ---------------------- | ------------ |
| 1   | 태그 필터 칩 목록 표시 | 태그 Issue 1 |
| 2   | 태그 선택 및 OR 필터링 | #1           |
| 3   | 필터 초기화 버튼       | #2           |
| 4   | 필터 빈 상태 메시지    | #2           |

---

## Issue 1: 태그 필터 칩 목록 표시

### 설명

NoteList 상단에 전체 노트의 태그 합집합을 `FilterTagChip` 형태로 표시하는 `TagFilter` 컴포넌트를 구현한다. 노트에 태그가 하나도 없으면 `TagFilter` 영역 자체가 렌더링되지 않는다. 노트 삭제로 특정 태그를 가진 노트가 없어지면 해당 칩이 자동으로 사라진다.

**구현 범위**

- `src/hooks/useFilter.ts` — `allTags` 파생(`notes.flatMap(n => n.tags)` + 중복 제거), 이번 이슈에서는 `allTags`만 반환
- `src/components/FilterTagChip.tsx` — `TagChipBase` 기반, 클릭 동작 없는 기본 칩 (선택 상태는 Issue 2)
- `src/components/TagFilter.tsx` — `FilterTagChip` 목록 렌더링, `allTags`가 비면 `null` 반환
- NoteList — `useFilter` 연결, `TagFilter` 렌더링

**참조**: PRD ADR-1, ADR-3, ADR-5

### 완료 조건 (Acceptance Criteria)

- [ ] 태그가 있는 노트가 하나라도 있으면 TagFilter가 NoteList 상단에 표시된다
- [ ] 칩 목록은 전체 노트의 태그 합집합이다 (중복 제거)
- [ ] 전체 노트에 태그가 하나도 없으면 TagFilter 영역이 렌더링되지 않는다
- [ ] 특정 태그를 가진 노트를 모두 삭제하면 해당 태그 칩이 자동으로 사라진다

### 시나리오

**Scenario 1 — 태그 칩 목록 표시**

```
Given: "react", "typescript" 태그가 있는 노트들이 존재한다
When:  NoteList를 본다
Then:  NoteList 상단에 "react", "typescript" 칩이 표시된다
```

**Scenario 2 — 중복 태그 제거**

```
Given: 두 노트가 모두 "react" 태그를 가지고 있다
When:  NoteList를 본다
Then:  "react" 칩이 하나만 표시된다
```

**Scenario 3 — 태그 없으면 TagFilter 미표시**

```
Given: 전체 노트에 태그가 하나도 없다
When:  NoteList를 본다
Then:  TagFilter 영역이 DOM에 존재하지 않는다
```

**Scenario 4 — 노트 삭제 시 태그 칩 자동 제거**

```
Given: "react" 태그를 가진 노트가 1개뿐이다
When:  해당 노트를 삭제한다
Then:  TagFilter에서 "react" 칩이 사라진다
```

---

## Issue 2: 태그 선택 및 OR 필터링

### 설명

`FilterTagChip`을 클릭하면 선택/해제가 토글되고, 선택된 태그를 OR 조건으로 적용해 NoteList를 즉시 필터링한다. 선택된 태그가 없으면 전체 노트가 표시된다. 노트 선택·새로고침·새 노트 생성은 필터 상태에 영향을 주지 않는다.

**구현 범위**

- `useFilter`에 `toggleTag`, `selectedTags`, `filteredNotes` 추가
  - `filteredNotes`: `selectedTags`가 비면 전체 `notes`, 아니면 `note.tags.some(tag => selectedTags.includes(tag))`
- `FilterTagChip`에 `selected` 상태 스타일 추가 (`--blue-soft` 배경, `--blue` 텍스트)
- NoteList에서 `notes` 대신 `filteredNotes`를 렌더링

**참조**: PRD ADR-1, ADR-2, ADR-4 / 디자인 스펙 `FilterTagChip` selected 상태

### 완료 조건 (Acceptance Criteria)

- [ ] 칩 클릭 → 선택 스타일로 바뀌고 노트 목록이 즉시 갱신된다
- [ ] 선택된 칩을 다시 클릭 → 선택 해제되고 목록이 갱신된다
- [ ] 태그 2개 이상 선택 시 OR 조건으로 필터링된다 (둘 중 하나라도 포함한 노트 표시)
- [ ] 선택된 태그가 없으면 전체 노트가 표시된다
- [ ] 노트를 클릭해도 필터 상태가 변하지 않는다
- [ ] 새로고침하면 필터 선택이 초기화되어 전체 노트가 표시된다
- [ ] 필터 중 새 노트 생성 시 필터 상태가 유지되며, 새 노트가 조건 미충족이면 목록에 표시되지 않는다

### 시나리오

**Scenario 1 — 태그 선택 및 필터링**

```
Given: "react", "typescript" 태그가 각각 다른 노트에 있다
When:  "react" 칩을 클릭한다
Then:  "react" 칩이 선택 스타일이 되고
       "react" 태그를 가진 노트만 목록에 표시된다
```

**Scenario 2 — 태그 선택 해제**

```
Given: "react" 칩이 선택된 상태다
When:  "react" 칩을 다시 클릭한다
Then:  선택이 해제되고 전체 노트가 표시된다
```

**Scenario 3 — OR 조건 다중 선택**

```
Given: 노트 A("react"), 노트 B("typescript"), 노트 C("vue")가 있다
When:  "react"와 "typescript" 칩을 모두 선택한다
Then:  노트 A와 노트 B가 표시되고 노트 C는 표시되지 않는다
```

**Scenario 4 — 선택 없으면 전체 표시**

```
Given: 아무 태그도 선택하지 않은 상태다
When:  NoteList를 본다
Then:  전체 노트가 표시된다
```

**Scenario 5 — 노트 클릭해도 필터 유지**

```
Given: "react" 칩이 선택된 상태다
When:  목록의 노트를 클릭한다
Then:  필터 상태가 유지되어 "react" 칩이 선택된 채 목록이 그대로다
```

**Scenario 6 — 새로고침 시 필터 초기화**

```
Given: "react" 칩이 선택된 상태다
When:  페이지를 새로고침한다
Then:  필터가 초기화되어 아무 칩도 선택되지 않고 전체 노트가 표시된다
```

**Scenario 7 — 필터 중 새 노트 생성**

```
Given: "react" 칩이 선택된 상태다
When:  태그가 없는 새 노트를 생성한다
Then:  필터 상태가 유지되고 새 노트는 목록에 표시되지 않는다
```

---

## Issue 3: 필터 초기화 버튼

### 설명

태그 칩이 2개 이상 선택된 경우에만 "필터 초기화" 버튼을 `TagFilter`에 노출한다. 클릭 시 모든 선택이 해제되고 전체 노트가 표시된다.

**구현 범위**

- `useFilter`에 `clearFilter` 추가 (`selectedTags`를 `[]`로 초기화)
- `TagFilter`에 조건부 "필터 초기화" 버튼 추가 (`selectedTags.length >= 2`일 때만 표시)

**참조**: PRD US-4, US-5

### 완료 조건 (Acceptance Criteria)

- [ ] 선택된 태그가 1개이면 "필터 초기화" 버튼이 표시되지 않는다
- [ ] 선택된 태그가 2개 이상이면 "필터 초기화" 버튼이 표시된다
- [ ] "필터 초기화" 버튼 클릭 → 모든 태그 선택이 해제되고 전체 노트가 표시된다
- [ ] 초기화 후 버튼이 사라진다

### 시나리오

**Scenario 1 — 2개 선택 시 버튼 노출**

```
Given: 태그 칩이 1개 선택된 상태다
When:  태그 칩을 하나 더 클릭한다
Then:  "필터 초기화" 버튼이 나타난다
```

**Scenario 2 — 1개로 줄면 버튼 숨김**

```
Given: 태그 칩이 2개 선택된 상태다
When:  칩 하나를 클릭해 선택을 해제한다
Then:  "필터 초기화" 버튼이 사라진다
```

**Scenario 3 — 초기화 버튼 클릭**

```
Given: "react", "typescript" 칩이 선택된 상태다
When:  "필터 초기화" 버튼을 클릭한다
Then:  모든 선택이 해제되고 전체 노트가 표시되며 버튼이 사라진다
```

---

## Issue 4: 필터 빈 상태 메시지

### 설명

선택된 태그가 있지만 OR 조건에 맞는 노트가 없을 때 "선택한 태그와 일치하는 노트가 없습니다." 빈 상태 메시지를 표시한다. 태그 선택이 없는 상태에서 노트 자체가 없을 때 표시되는 기존 "메모 없음" 빈 상태와 구별된다.

**구현 범위**

- NoteList에서 `selectedTags.length > 0 && filteredNotes.length === 0`일 때 필터 빈 상태 렌더링
- 기존 `.empty` 컴포넌트 패턴 사용, 메시지: "선택한 태그와 일치하는 노트가 없습니다."

**참조**: PRD US-7 / 디자인 스펙 빈 상태 컴포넌트

### 완료 조건 (Acceptance Criteria)

- [ ] 태그가 선택되어 있고 조건에 맞는 노트가 없으면 빈 상태 메시지가 표시된다
- [ ] 메시지 텍스트는 "선택한 태그와 일치하는 노트가 없습니다."다
- [ ] 선택을 해제하면 빈 상태 메시지가 사라지고 전체 노트가 표시된다
- [ ] 태그 선택이 없는 상태에서 노트가 없을 때는 기존 "메모 없음" 빈 상태가 표시된다

### 시나리오

**Scenario 1 — 필터 빈 상태 표시**

```
Given: "react" 칩이 선택되어 있다
And:   "react" 태그를 가진 노트가 하나도 없다
When:  NoteList를 본다
Then:  "선택한 태그와 일치하는 노트가 없습니다." 메시지가 표시된다
```

**Scenario 2 — 선택 해제 시 빈 상태 제거**

```
Given: 빈 상태 메시지가 표시되어 있다
When:  선택된 칩을 클릭해 선택을 해제한다
Then:  빈 상태 메시지가 사라지고 전체 노트가 표시된다
```

**Scenario 3 — 기존 빈 상태와 충돌 없음**

```
Given: 노트가 하나도 없고 아무 태그도 선택되지 않은 상태다
When:  NoteList를 본다
Then:  "메모 없음" 기존 빈 상태 메시지가 표시된다
       (필터 빈 상태 메시지가 아님)
```
