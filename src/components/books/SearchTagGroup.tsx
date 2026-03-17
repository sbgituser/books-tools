"use client";

/**
 * SearchTagGroup.tsx
 * タグチップのグループ表示・複数選択コンポーネント
 */

interface TagItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
}

interface Props {
  title: string;
  tags: readonly TagItem[];
  selected: string[];
  onToggle: (id: string) => void;
  colorClass?: string;
  selectedClass?: string;
}

export default function SearchTagGroup({
  title,
  tags,
  selected,
  onToggle,
  colorClass = "bg-stone-100 text-stone-600 hover:bg-stone-200",
  selectedClass = "bg-rose-500 text-white border-rose-500",
}: Props) {
  return (
    <div>
      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => {
          const isSelected = selected.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
              aria-pressed={isSelected}
              className={`
                inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border transition-all
                font-medium cursor-pointer select-none
                ${isSelected
                  ? selectedClass
                  : `${colorClass} border-transparent`
                }
              `}
            >
              {tag.icon && <span aria-hidden="true">{tag.icon}</span>}
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
