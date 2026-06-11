# Issue 6 — Save 시 tags 서버 저장

> AC·시나리오의 단일 출처(SSOT)는 이 파일이며, 상위 기획 맥락은 `issues.md` / `prd.md` 참조.

## 설명

Save 버튼 클릭 시 `tags`를 `title`, `content`와 함께 서버로 전송한다. 태그가 없는 노트 저장 시에도 `tags: []`를 명시적으로 전송해 이후 조회 시 일관성을 유지한다.

## 구현 범위

- `NotesContext.createNote` 시그니처에 `tags` 파라미터 추가, `api.createNote({ title, content, tags })` 호출
- `NoteEditor.handleSave`에서 `createNote(title, content, tags)` / `updateNote(id, { title, content, tags })` 호출
- `api/notes.ts`는 **변경 없음** — `createNote`(`Omit<Note,...>`)·`updateNote`(`Partial<Note>`)가 이미 `tags`를 구조적으로 수용하며 `...note`/`...updates` 스프레드로 payload에 포함

## 시그니처

### Context 액션 (`src/context/NotesContext.tsx`)

```ts
// createNote: tags 파라미터 추가
createNote: (title: string, content: string, tags: string[]) => Promise<void>;
//   변경: api.createNote({ title, content, tags })

// updateNote: 변경 없음 (이미 Partial<Note>로 tags 수용)
updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
```

### api/notes.ts — 변경 없음

- `createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>)` — `tags?` 이미 수용
- `updateNote(id, updates: Partial<Note>)` — 이미 수용
- 호출부(Context)가 `tags`를 넘기면 기존 스프레드로 payload에 자동 포함

### NoteEditor `handleSave`

```ts
if (isCreating) {
  await createNote(title, content, tags);
} else if (selectedNoteId) {
  await updateNote(selectedNoteId, { title, content, tags });
}
```

> `tags`는 `useTags`에서 항상 `string[]`이라 빈 노트도 `tags: []`가 보장됨 (AC #2). 별도 `?? []` 방어 불필요.

### 타입 확장

- 없음 (`Note.tags`는 이슈 3에서 추가됨)

### 참고 — AC #4 "토스트 피드백" 해석

현재 코드에 토스트는 없다. 저장 성공 피드백은 `onDone()` 콜백 호출이다. AC #4는 "저장 성공 시 `onDone()`이 그대로 호출된다(회귀 없음)"로 해석한다.

---

## 완료 조건 (Acceptance Criteria)

- [ ] Save 클릭 시 `tags`가 포함된 payload가 서버로 전송된다
- [ ] 태그가 없는 노트 저장 시 `tags: []`가 전송된다
- [ ] 저장 후 페이지를 새로고침하고 노트를 다시 열면 저장된 태그가 표시된다
- [ ] 저장 성공 시 기존 피드백(`onDone`)이 그대로 동작한다

## 테스트 시나리오

### NoteEditor 통합 (handleSave)

- [정상] `NoteEditor` — should call updateNote with the current tags when saving an existing note that has tags ✅
- [경계] `NoteEditor` — should call updateNote with an empty tags array when the note has no tags ✅
- [정상] `NoteEditor` — should call createNote with the entered tags when saving a new note ✅
- [정상] `NoteEditor` — should call onDone after a successful save (existing feedback preserved) ✅

> **AC #3(새로고침 후 재표시)** 는 영속성/E2E 성격이라 단위 테스트로 직접 검증하지 않는다. 저장 시 tags 전송(위 정상/경계 시나리오) + 이슈 3의 "노트 전환 시 selectedNote.tags 동기화"(기존 통과 테스트)로 전 구간이 커버되며, 실제 새로고침 표시는 수동 확인으로 보완한다.
