'use client';

import { useState } from 'react';
import { GripVertical } from 'lucide-react';

/**
 * HTML5 drag-and-drop reorderable list.
 * `items` must be objects with `_id`; calls `onReorder(newItems)` after a drop.
 */
export default function DragList({ items = [], onReorder, renderItem, className = '' }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const drop = (to) => {
    if (dragIndex === null || dragIndex === to) { setDragIndex(null); setOverIndex(null); return; }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(to, 0, moved);
    setDragIndex(null); setOverIndex(null);
    onReorder?.(next);
  };

  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item, i) => (
        <li
          key={item._id || item.key || i}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
          onDragLeave={() => setOverIndex((x) => (x === i ? null : x))}
          onDrop={() => drop(i)}
          onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
          className={`flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 cursor-grab active:cursor-grabbing transition-all duration-200
            ${overIndex === i ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}
            ${dragIndex === i ? 'opacity-40' : ''}`}
        >
          <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
          <div className="flex-1 min-w-0">{renderItem ? renderItem(item, i) : item.label || item.title}</div>
        </li>
      ))}
      {!items.length ? <li className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-xl">لا توجد عناصر</li> : null}
    </ul>
  );
}
