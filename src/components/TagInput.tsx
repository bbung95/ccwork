// stub: Green 단계에서 onAdd 호출 로직을 채운다
interface TagInputProps {
  onAdd: (value: string) => void;
}

export function TagInput({ onAdd }: TagInputProps) {
  void onAdd;
  return <input type="text" placeholder="태그 추가" />;
}
