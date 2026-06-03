# 태그 기능 이슈 목록

> 참조: `docs/features/tag/prd.md`, `docs/design-system/components/TagChip.md`
> 수직 슬라이싱 원칙에 따라 분해. 각 이슈는 사용자에게 보이는 변화를 독립적으로 전달한다.

| #   | 이슈                   | 의존 |
| --- | ---------------------- | ---- |
| 1   | 태그 추가 및 chip 표시 | —    |
| 2   | 태그 삭제              | #1   |
| 3   | 태그 10개 제한         | #1   |
| 4   | Save 시 tags 서버 저장 | #1   |

---

## Issue 1: 태그 추가 및 chip 표시

### 설명

NoteEditor에서 태그를 입력하고 Enter를 누르면 `EditorTagChip`으로 표시되는 기능을 구현한다. 입력값은 `trim()`으로 정규화되며, 중복 입력은 무시된다. 태그가 없는 상태에서는 태그 영역 전체가 렌더링되지 않는다. 노트 전환 시 태그 상태가 새 노트에 맞게 동기화된다.

**구현 범위**

- `Note` 타입에 `tags: string[]` 추가
- `src/hooks/useTags.ts` — `tags` 상태, `addTag(trim + 중복 검사)`, `setTags`
- `src/components/TagChipBase.tsx` — 공유 칩 외형 (높이 28px, `--line-2` 배경, `--r-chip`)
- `src/components/EditorTagChip.tsx` — 태그 텍스트 표시 (X 버튼은 Issue 2)
- `src/components/TagInput.tsx` — `onKeyDown` Enter 핸들러, 입력 초기화
- NoteEditor — 태그 영역 조건부 렌더링 (`tags.length > 0`일 때만), `selectedNote.tags ?? []` 방어적 읽기, `useEffect`에서 노트 전환 시 `setTags` 호출

**참조**: PRD ADR-1, ADR-2, ADR-3, ADR-4 / 디자인 스펙 `docs/design-system/components/TagChip.md`

### 완료 조건 (Acceptance Criteria)

- [ ] 태그 입력 후 Enter → chip이 추가된다
- [ ] 앞뒤 공백 포함 입력 → trim 후 chip이 추가된다
- [ ] 공백만 입력 후 Enter → 변화 없다
- [ ] 이미 존재하는 태그와 동일한 값 입력 → 무시된다
- [ ] Enter 외 다른 키는 태그를 추가하지 않는다
- [ ] 태그가 0개인 노트 → 태그 영역이 렌더링되지 않는다
- [ ] 태그가 1개 이상인 노트 → 태그 영역이 렌더링된다
- [ ] `tags` 필드가 없는 기존 노트를 열어도 런타임 에러가 발생하지 않는다
- [ ] 다른 노트를 선택하면 이전 노트의 편집 중인 태그가 초기화되고 새 노트의 태그가 표시된다
- [ ] 저장하지 않은 태그 변경사항은 노트 전환 시 유실된다

### 시나리오

**Scenario 1 — 정상 추가**

```
Given: NoteEditor가 열려 있고 태그가 없다
When:  "React"를 입력하고 Enter를 누른다
Then:  "react" chip이 표시된다
And:   입력 필드가 초기화된다
```

**Scenario 2 — 앞뒤 공백 trim**

```
Given: NoteEditor가 열려 있다
When:  "  react  "를 입력하고 Enter를 누른다
Then:  "react" chip이 표시된다
```

**Scenario 4 — 중복 무시**

```
Given: "react" 태그가 이미 있다
When:  "React"를 입력하고 Enter를 누른다
Then:  태그 목록에 변화가 없다
```

**Scenario 5 — 공백만 입력 무시**

```
Given: NoteEditor가 열려 있다
When:  "   "를 입력하고 Enter를 누른다
Then:  아무 변화도 없다
```

**Scenario 6 — 태그 없으면 영역 미표시**

```
Given: 태그가 없는 노트가 열려 있다
When:  NoteEditor가 렌더링된다
Then:  태그 영역(TagInput 포함)이 DOM에 존재하지 않는다
```

**Scenario 7 — 기존 노트(tags 필드 없음) 정상 로드**

```
Given: db.json에 tags 필드가 없는 기존 노트가 있다
When:  해당 노트를 NoteEditor에서 연다
Then:  에러 없이 렌더링되며 태그 영역이 표시되지 않는다
```

**Scenario 8 — 노트 전환 시 미저장 태그 유실**

```
Given: "react" 태그가 저장된 노트 A를 편집 중이다
And:   "typescript"를 추가했으나 Save하지 않았다
When:  노트 B를 클릭한다
Then:  "typescript"가 유실되고 노트 B의 저장된 태그가 표시된다
```

**Scenario 9 — 태그 없는 노트로 전환**

```
Given: "react" 태그가 있는 노트 A를 보고 있다
When:  태그가 없는 노트 B를 선택한다
Then:  태그 영역 전체가 사라지고 노트 A의 태그가 남아 있지 않다
```

---

## Issue 2: 태그 삭제

### 설명

`EditorTagChip`의 X 버튼을 클릭하면 해당 태그를 즉시 삭제한다. 확인 단계 없이 바로 제거되며, 마지막 태그 삭제 시 태그 영역 전체가 사라진다.

**구현 범위**

- `useTags`에 `removeTag(tag: string)` 액션 추가
- `EditorTagChip`에 X 버튼 추가 (`onRemove` prop 연결)
- X 버튼 스타일: `--ink-3`, hover 시 `--red-soft` 배경

**참조**: PRD US-5 / 디자인 스펙 `EditorTagChip` X 버튼 hover 규칙

### 완료 조건 (Acceptance Criteria)

- [ ] chip의 X 버튼 클릭 → 해당 태그가 즉시 제거된다
- [ ] 확인 dialog 없이 바로 삭제된다
- [ ] 마지막 태그를 삭제하면 태그 영역 전체가 사라진다
- [ ] X 버튼 hover 시 `--red-soft` 배경이 적용된다

### 시나리오

**Scenario 1 — 태그 삭제**

```
Given: "react", "typescript" 태그가 있다
When:  "react" chip의 X 버튼을 클릭한다
Then:  "react"가 제거되고 "typescript"만 남는다
```

**Scenario 2 — 마지막 태그 삭제**

```
Given: "react" 태그 하나만 있다
When:  X 버튼을 클릭한다
Then:  태그가 제거되고 태그 영역 전체가 사라진다
```

---

## Issue 3: 태그 10개 제한

### 설명

태그가 10개에 도달하면 `TagInput` 입력 필드를 `disabled` 처리하여 더 이상 추가할 수 없게 한다. X 버튼을 통한 삭제는 10개 상태에서도 가능하며, 삭제 후 10개 미만이 되면 입력 필드가 다시 활성화된다.

**구현 범위**

- `useTags`의 `addTag`에서 `tags.length >= 10`이면 early return
- `TagInput`에 `disabled` prop 추가 (`tags.length >= 10`일 때 전달)

**참조**: PRD US-6

### 완료 조건 (Acceptance Criteria)

- [ ] 태그가 10개 미만일 때 입력 필드가 활성화되어 있다
- [ ] 태그가 10개에 도달하면 입력 필드가 `disabled` 상태가 된다
- [ ] `disabled` 상태에서도 X 버튼으로 태그 삭제가 가능하다
- [ ] 태그를 삭제해 9개가 되면 입력 필드가 다시 활성화된다
- [ ] `disabled` 상태에서 Enter를 눌러도 태그가 추가되지 않는다

### 시나리오

**Scenario 1 — 10개 도달 시 입력 비활성화**

```
Given: 태그가 10개 있다
When:  NoteEditor 태그 영역을 본다
Then:  태그 입력 필드가 disabled 상태다
```

**Scenario 2 — 삭제 후 재활성화**

```
Given: 태그가 10개 있고 입력 필드가 비활성화되어 있다
When:  태그 하나를 X 버튼으로 삭제한다
Then:  태그가 9개가 되고 입력 필드가 활성화된다
```

**Scenario 3 — disabled 상태에서 추가 시도 무시**

```
Given: 태그가 10개 있다
When:  (JS로) addTag를 직접 호출한다
Then:  태그 목록에 변화가 없다
```

---

## Issue 4: Save 시 tags 서버 저장

### 설명

Save 버튼 클릭 시 `tags`를 `title`, `content`와 함께 서버로 전송한다. `api/notes.ts`의 `updateNote` / `createNote` payload에 `tags`를 포함하고, NoteEditor의 `handleSave`에서 이를 전달한다. 태그가 없는 노트 저장 시에도 `tags: []`를 명시적으로 전송하여 이후 조회 시 일관성을 유지한다.

**구현 범위**

- `api/notes.ts` `updateNote` / `createNote` payload에 `tags` 포함
- NoteEditor `handleSave`에서 `updateNote({ title, content, tags })` 호출

**참조**: PRD US-7, ADR-1

### 완료 조건 (Acceptance Criteria)

- [ ] Save 클릭 시 `tags`가 포함된 payload가 서버로 전송된다
- [ ] 태그가 없는 노트 저장 시 `tags: []`가 전송된다
- [ ] 저장 후 페이지를 새로고침하고 노트를 다시 열면 저장된 태그가 표시된다
- [ ] 저장 성공 시 기존 토스트 피드백이 그대로 동작한다

### 시나리오

**Scenario 1 — 태그 포함 저장**

```
Given: "react", "typescript" 태그가 있는 노트를 편집 중이다
When:  Save 버튼을 클릭한다
Then:  서버에 { title, content, tags: ["react", "typescript"] }가 저장된다
And:   성공 토스트가 표시된다
```

**Scenario 2 — 태그 없는 노트 저장**

```
Given: 태그가 없는 노트를 편집 중이다
When:  Save 버튼을 클릭한다
Then:  서버에 { title, content, tags: [] }가 저장된다
```

**Scenario 3 — 저장 후 재오픈**

```
Given: "react" 태그를 추가하고 Save 했다
When:  페이지를 새로고침하고 해당 노트를 다시 연다
Then:  "react" chip이 표시된다
```
