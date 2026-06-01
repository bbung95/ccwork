#!/bin/bash
# PostToolUse hook: Edit/Write 후 디자인 시스템 규칙 위반 검사

INPUT=$(cat)
TOOL=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_name',''))" 2>/dev/null || echo "")
FILE=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")

[[ "$TOOL" == "Edit" || "$TOOL" == "Write" ]] || exit 0
[[ "$FILE" =~ \.(tsx|css)$ ]] || exit 0
[ -f "$FILE" ] || exit 0

WARNS=()

# [tokens] border: solid — 경계는 shadow로 표현 (핀 상태 예외)
if grep -qE "border:\s*[0-9.]+px\s+solid" "$FILE"; then
  WARNS+=("[tokens] 'border: solid' 감지 — 경계는 box-shadow(var(--shadow-*))로 표현 (핀 상태 예외)")
fi

# [tokens] box-shadow 하드코딩 — var(--shadow-*) 사용 권장
if grep -E "box-shadow:" "$FILE" | grep -qvE "var\(--shadow|none|inherit|initial"; then
  WARNS+=("[tokens] box-shadow 하드코딩 — var(--shadow-sm/md/lg) 사용")
fi

# [tokens] hex 색상 직접 사용 — CSS 변수 정의 라인(--xxx:) 및 주석 제외
if grep -E ":\s*#[0-9a-fA-F]{3,6}" "$FILE" | grep -qvE "^\s*--|/\*|//"; then
  WARNS+=("[tokens] 하드코딩 hex 색상 감지 — var(--blue), var(--ink) 등 CSS 변수 사용")
fi

# [motion] linear 이징 금지 — 기계적인 느낌
if grep -qiE "(transition|animation)[^;{]*\blinear\b" "$FILE"; then
  WARNS+=("[motion] 'linear' 이징 금지 — cubic-bezier(0.16, 1, 0.3, 1) 또는 ease 사용")
fi

# [motion] 1초 초과 transition 금지
if grep -qE "transition[^;{]+[[:space:]]+[1-9][0-9]*s[[:space:],;]" "$FILE"; then
  WARNS+=("[motion] transition 1s 초과 감지 — 등장 0.32s 이하, 상호작용 0.2s 이하 권장")
fi

# [typography] letter-spacing: 0 또는 양수 금지
if grep -qE "letter-spacing:\s*(0[^.-em]|0$|[1-9][0-9]*px|0\.[0-9]+em[^-])" "$FILE"; then
  WARNS+=("[typography] letter-spacing: 0 또는 양수 금지 — -0.01em~-0.03em 사용")
fi

# [typography] 정의되지 않은 임의 font-weight 금지 (허용: 400/500/600/700)
if grep -E "font-weight:\s*[0-9]+" "$FILE" | grep -qvE "font-weight:\s*(400|500|600|700)"; then
  WARNS+=("[typography] 허용되지 않은 font-weight — 400/500/600/700 만 사용")
fi

# [layout] position: fixed — 상단바는 sticky 사용
if grep -qE "position:\s*fixed" "$FILE"; then
  WARNS+=("[layout] 'position: fixed' 감지 — 상단바는 position: sticky 사용")
fi

if [ ${#WARNS[@]} -gt 0 ]; then
  echo ""
  echo "디자인 시스템 위반 감지 (${FILE##*/}):"
  for w in "${WARNS[@]}"; do
    echo "  - $w"
  done
fi

exit 0
