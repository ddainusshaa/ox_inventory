import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useDragLayer, useDragDropManager } from 'react-dnd';
import { DragSource } from '../../typings';

const clearDragSlotClasses = () => {
  document
    .querySelectorAll('.inventory-slot--drag-source, .inventory-slot--drag-over')
    .forEach((element) => element.classList.remove('inventory-slot--drag-source', 'inventory-slot--drag-over'));
};

const DragPreview: React.FC = () => {
  const manager = useDragDropManager();
  const rootRef = useRef<HTMLDivElement>(null);

  const { data, isDragging } = useDragLayer((monitor) => ({
    data: monitor.getItem() as DragSource | null,
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    document.body.classList.toggle('inv-dragging', isDragging);
    if (!isDragging) clearDragSlotClasses();

    return () => {
      document.body.classList.remove('inv-dragging');
      clearDragSlotClasses();
    };
  }, [isDragging]);

  useLayoutEffect(() => {
    if (!isDragging || !data?.item) {
      clearDragSlotClasses();
      return;
    }

    const monitor = manager.getMonitor();
    const el = rootRef.current;
    const apply = () => {
      const offset = monitor.getClientOffset();
      if (el && offset) {
        el.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0) translate(-50%, -50%)`;

        clearDragSlotClasses();

        const source = document.querySelector<HTMLElement>(
          `.inventory-slot[data-inventory-type="${data.inventory}"][data-slot="${data.item.slot}"]`
        );
        const hovered = document.elementFromPoint(offset.x, offset.y)?.closest<HTMLElement>('.inventory-slot');

        source?.classList.add('inventory-slot--drag-source');
        if (hovered && hovered !== source) hovered.classList.add('inventory-slot--drag-over');
      }
    };
    apply();
    return monitor.subscribeToOffsetChange(apply);
  }, [isDragging, manager]);

  if (!isDragging || !data?.item) return null;

  return <div className="item-drag-preview" ref={rootRef} style={{ backgroundImage: data.image }} />;
};

export default DragPreview;
