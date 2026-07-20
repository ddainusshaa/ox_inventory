import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inventory } from '../../typings';
import SegmentedWeightBar from '../utils/SegmentedWeightBar';
import InventorySlot from './InventorySlot';
import { getTotalWeight } from '../../helpers';
import { useAppSelector } from '../../store';
import { useIntersection } from '../../hooks/useIntersection';
import { Locale } from '../../store/locale';

const PAGE_SIZE = 30;
const GRID_ROW_HEIGHT = '10.42vh';

const PocketIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[2vh] w-[2vh] shrink-0 text-muted-foreground"
    aria-hidden
  >
    <path d="M4 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
    <path d="M9 11h6" />
  </svg>
);

const InventoryGrid: React.FC<{
  inventory: Inventory;
  panelTitle: string;
  panelSubtitle: string;
  showSectionLabels?: boolean;
  showPocketIcon?: boolean;
}> = ({ inventory, panelTitle, panelSubtitle, showSectionLabels = false, showPocketIcon = false }) => {
  const weight = useMemo(
    () => (inventory.maxWeight !== undefined ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0),
    [inventory.maxWeight, inventory.items]
  );
  const [page, setPage] = useState(0);
  const containerRef = useRef(null);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useAppSelector((state) => state.inventory.isBusy);
  const weightPercent = inventory.maxWeight ? (weight / inventory.maxWeight) * 100 : 0;

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      setPage((prev) => ++prev);
    }
  }, [entry]);

  return (
    <div
      className="relative rounded-[var(--radius)] border border-border bg-card-glass p-[1.5vh] shadow-lg"
      style={{ pointerEvents: isBusy ? 'none' : 'auto' }}
    >
      <div className="relative flex flex-col gap-[0.8vh]">
        <div className="flex items-start justify-between gap-[1vh]">
          <div className="flex min-w-0 items-start gap-[0.8vh]">
            {showPocketIcon && <PocketIcon />}
            <div className="min-w-0">
              <p className="truncate text-[1.5vh] font-semibold leading-tight text-foreground">{panelTitle}</p>
              <p className="truncate text-[1.1vh] text-muted-foreground">{panelSubtitle}</p>
            </div>
          </div>
          {inventory.maxWeight !== undefined && (
            <div className="flex shrink-0 flex-col items-end gap-[0.4vh]">
              <p className="text-[1.1vh] font-medium uppercase tracking-wide text-muted-foreground">
                {weight / 1000} / {inventory.maxWeight / 1000} KG
              </p>
              <div className="w-[12vh]">
                <SegmentedWeightBar percent={weightPercent} />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-[0.6vh]">
          {showSectionLabels && (
            <div className="flex w-[1.6vh] shrink-0 flex-col">
              <div className="flex items-center justify-center" style={{ height: GRID_ROW_HEIGHT }}>
                <span className="rotate-180 text-[0.85vh] font-medium uppercase tracking-[0.15em] text-muted-foreground [writing-mode:vertical-rl]">
                  {Locale.ui_hotbar_label}
                </span>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <span className="rotate-180 text-[0.85vh] font-medium uppercase tracking-[0.15em] text-muted-foreground [writing-mode:vertical-rl]">
                  {Locale.ui_inventory_label}
                </span>
              </div>
            </div>
          )}

          <div
            className={`inventory-grid-container min-w-0 flex-1${showSectionLabels ? ' inventory-grid-container--hotbar' : ''}`}
            ref={containerRef}
          >
            {inventory.items.slice(0, (page + 1) * PAGE_SIZE).map((item, index) => (
              <InventorySlot
                key={`${inventory.type}-${inventory.id}-${item.slot}`}
                item={item}
                ref={index === (page + 1) * PAGE_SIZE - 1 ? ref : null}
                inventoryType={inventory.type}
                inventoryGroups={inventory.groups}
                inventoryId={inventory.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryGrid;
