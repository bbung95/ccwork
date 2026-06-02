# TagChip

태그를 표현하는 칩 컴포넌트 계층. 토큰 값은 `../tokens.md` 참조.

---

## 계층 구조

```
TagChipBase          ← 외형(shape, color, spacing)만 정의
├── EditorTagChip    ← NoteEditor 전용, X 버튼 포함
└── FilterTagChip    ← TagFilter 전용, 선택 토글 상태
```

새로운 칩 변형이 필요할 때는 `TagChipBase`를 기반으로 새 컴포넌트를 추가한다. 기존 컴포넌트는 건드리지 않는다.

---

## TagChipBase

공유 외형만 담당하는 원시 컴포넌트. 직접 렌더하지 않고 `EditorTagChip` · `FilterTagChip`이 내부적으로 사용한다.

| 속성     | 값                                               |
| -------- | ------------------------------------------------ |
| 높이     | 28px                                             |
| 패딩     | `4px 10px`                                       |
| 배경     | `--line-2`                                       |
| 텍스트   | `--ink-2`, 13px, weight 500                      |
| 라운드   | `--r-chip` (100px, pill)                         |
| 레이아웃 | `inline-flex`, `align-items: center`, `gap: 4px` |

---

## EditorTagChip

NoteEditor 태그 영역에서 사용. 태그 텍스트 + X(삭제) 버튼으로 구성.

| 상태         | 스타일                                      |
| ------------ | ------------------------------------------- |
| 기본         | TagChipBase 그대로                          |
| X 버튼 기본  | `--ink-3`, 16×16px, r: `11px`, 배경 투명    |
| X 버튼 hover | `--red-soft` 배경 (`icon-btn .danger` 패턴) |

- X 버튼 클릭은 즉시 삭제, 확인 단계 없음
- 태그 10개 도달 시 X 버튼은 유지(삭제는 가능), 입력 필드만 `disabled`

---

## FilterTagChip

TagFilter 영역에서 사용. 클릭으로 선택/해제 토글.

| 상태              | 배경          | 텍스트    |
| ----------------- | ------------- | --------- |
| 기본 (unselected) | `--line-2`    | `--ink-2` |
| hover             | `--line`      | `--ink-2` |
| 선택 (selected)   | `--blue-soft` | `--blue`  |

- `transition: background-color 0.15s`
- selected 상태에서는 hover 효과 없음 (배경 고정)
- 클릭 시 `scale(0.96)` active 피드백 포함

---

## Do / Don't

**Do**

- 새 칩 변형은 반드시 `TagChipBase`를 기반으로 만든다.
- `EditorTagChip`은 NoteEditor 외 다른 컨텍스트에서 사용하지 않는다.
- `FilterTagChip`은 TagFilter 외 다른 컨텍스트에서 사용하지 않는다.
- X 버튼 hover는 반드시 `--red-soft` 배경을 사용한다 (아이콘 버튼 danger 패턴과 동일).
- selected 상태는 반드시 `--blue-soft` 배경 + `--blue` 텍스트 조합으로 표현한다.

**Don't**

- `TagChipBase`를 직접 JSX에 렌더하지 않는다 — 반드시 특화 컴포넌트를 통해 사용한다.
- `EditorTagChip`과 `FilterTagChip`을 단일 컴포넌트로 합치고 variant prop으로 분기하지 않는다.
- 칩 라운드를 `--r-chip`(100px) 외 다른 값으로 변경하지 않는다.
- 선택 상태를 배경색 외 보더나 그림자로 표현하지 않는다.
