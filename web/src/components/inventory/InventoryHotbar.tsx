import React, { useMemo, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { getItemUrl, isSlotWithItem } from '../../helpers';
import useNuiEvent from '../../hooks/useNuiEvent';
import { Items } from '../../store/items';
import DurabilityBar from '../utils/WeightBar';
import HotbarBadge from '../utils/HotbarBadge';
import { useAppSelector } from '../../store';
import { selectEquippedSlot, selectLeftInventory } from '../../store/inventory';
import { SlotWithItem } from '../../typings';

const formatWeight = (weight: number) =>
  weight >= 1000
    ? `${(weight / 1000).toLocaleString('en-us', { minimumFractionDigits: 2 })}kg`
    : `${weight.toLocaleString('en-us', { minimumFractionDigits: 0 })}g`;

const InventoryHotbar: React.FC = () => {
  const [hotbarVisible, setHotbarVisible] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const items = useAppSelector(selectLeftInventory).items;
  const equippedSlot = useAppSelector(selectEquippedSlot);
  const hotbarSlots = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const slot = index + 1;
        return items.find((item) => item.slot === slot) || { slot };
      }),
    [items]
  );

  const [handle, setHandle] = useState<ReturnType<typeof setTimeout>>();
  useNuiEvent('toggleHotbar', () => {
    if (hotbarVisible) {
      setHotbarVisible(false);
    } else {
      if (handle) clearTimeout(handle);
      setHotbarVisible(true);
      setHandle(setTimeout(() => setHotbarVisible(false), 3000));
    }
  });

  return (
    <CSSTransition in={hotbarVisible} nodeRef={nodeRef} classNames="transition-fade" timeout={250} unmountOnExit>
      <div ref={nodeRef} className="hotbar-container">
        {hotbarSlots.map((item) => {
          const hasItem = isSlotWithItem(item);
          const isEquipped = equippedSlot === item.slot;

          return (
            <div
              key={`hotbar-${item.slot}`}
              className={`overlay-slot ${isEquipped ? 'ring-1 ring-brand' : ''}`}
              style={{
                backgroundImage: hasItem ? `url(${getItemUrl(item as SlotWithItem) || 'none'})` : undefined,
              }}
            >
              <HotbarBadge number={item.slot} />

              {hasItem && (
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex-1" />

                  <div className="relative z-10 flex items-end justify-between gap-[0.2vh] px-[0.35vh] pb-[0.45vh]">
                    <span
                      className="max-w-[62%] truncate text-[0.78vh] font-medium leading-tight text-foreground"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {item.metadata?.label ? item.metadata.label : Items[item.name]?.label || item.name}
                    </span>
                    <div className="flex shrink-0 flex-col items-end gap-[0.1vh]">
                      {item.weight > 0 && (
                        <span className="text-[0.9vh] text-muted-foreground">{formatWeight(item.weight)}</span>
                      )}
                      {item.count !== undefined && item.count > 1 && (
                        <span
                          className="inline-flex h-[1.5vh] items-center rounded-[0.25vh] bg-black/55 px-[0.45vh] text-[0.85vh] font-medium tabular-nums text-foreground"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {item.count.toLocaleString('en-us')}x
                        </span>
                      )}
                    </div>
                  </div>

                  {item?.durability !== undefined && <DurabilityBar percent={item.durability} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CSSTransition>
  );
};

export default InventoryHotbar;
