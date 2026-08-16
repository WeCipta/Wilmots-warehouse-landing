export function SelectionOutline({
  selected,
  color,
}: {
  selected: boolean;
  color?: string;
}) {
  if (!selected || !color) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 rounded-[6px]"
      style={{ boxShadow: `0 0 0 4px ${color}` }}
    />
  );
}
