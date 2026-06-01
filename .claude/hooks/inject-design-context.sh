#!/bin/bash
# UserPromptSubmit hook: 스타일 관련 프롬프트 감지 시 디자인 시스템 파일을 컨텍스트에 주입한다.

PROMPT=$(cat | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))" 2>/dev/null || echo "")

# 디자인 시스템 파일 경로 (프로젝트 루트 기준)
DS="./docs/design-system"

# 파일이 없으면 아무것도 하지 않는다
[ -d "$DS" ] || exit 0

inject() {
  local file="$DS/$1"
  [ -f "$file" ] && printf "\n---\n" && cat "$file"
}

echo "$PROMPT" | grep -qiE "색상|color|css|변수|token|그림자|shadow|배경|background|border|테두리|--blue|--red|--ink|--surface" && inject "tokens.md"
echo "$PROMPT" | grep -qiE "폰트|font|텍스트|text|타이포|크기|size|굵기|weight|행간|자간|letter.spacing|pretendard" && inject "typography.md"
echo "$PROMPT" | grep -qiE "레이아웃|layout|그리드|grid|반응형|responsive|컬럼|column|메이슨리|masonry|뷰포트|viewport" && inject "layout.md"
echo "$PROMPT" | grep -qiE "버튼|button|카드|card|모달|modal|인풋|input|토스트|toast|컴포넌트|component|빈.상태|empty|스크림|scrim" && inject "components.md"
echo "$PROMPT" | grep -qiE "애니메이션|animation|트랜지션|transition|아이콘|icon|모션|motion|hover|이징|easing|cubic.bezier|translateY|scale" && inject "motion.md"

exit 0
