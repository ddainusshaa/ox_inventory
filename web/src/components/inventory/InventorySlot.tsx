import React, { useCallback, useRef } from 'react';
import { DragSource, Inventory, InventoryType, Slot, SlotWithItem } from '../../typings';
import { useDrag, useDragDropManager, useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '../../store';
import DurabilityBar from '../utils/WeightBar';
import HotbarBadge from '../utils/HotbarBadge';
import { onDrop } from '../../dnd/onDrop';
import { onBuy } from '../../dnd/onBuy';
import { Items } from '../../store/items';
import { canCraftItem, canPurchaseItem, getItemUrl, isSlotWithItem } from '../../helpers';
import { onUse } from '../../dnd/onUse';
import { Locale } from '../../store/locale';
import { onCraft } from '../../dnd/onCraft';
import useNuiEvent from '../../hooks/useNuiEvent';
import { ItemsPayload } from '../../reducers/refreshSlots';
import { closeTooltip, openTooltip } from '../../store/tooltip';
import { openContextMenu } from '../../store/contextMenu';
import { selectEquippedSlot } from '../../store/inventory';
import { useMergeRefs } from '@floating-ui/react';

interface SlotProps {
  inventoryId: Inventory['id'];
  inventoryType: Inventory['type'];
  inventoryGroups: Inventory['groups'];
  item: Slot;
}

const formatWeight = (weight: number) =>
  weight >= 1000
    ? `${(weight / 1000).toLocaleString('en-us', { minimumFractionDigits: 2 })}kg`
    : `${weight.toLocaleString('en-us', { minimumFractionDigits: 0 })}g`;

const InventorySlot: React.ForwardRefRenderFunction<HTMLDivElement, SlotProps> = (
  { item, inventoryId, inventoryType, inventoryGroups },
  ref
) => {
  const manager = useDragDropManager();
  const dispatch = useAppDispatch();
  const equippedSlot = useAppSelector(selectEquippedSlot);
  const timerRef = useRef<number | null>(null);
  const isHotbar = inventoryType === 'player' && item.slot <= 5;
  const isEquipped = inventoryType === 'player' && equippedSlot === item.slot;

  const canDrag = useCallback(() => {
    return canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) && canCraftItem(item, inventoryType);
  }, [item, inventoryType, inventoryGroups]);

  const [{ isDragging }, drag] = useDrag<DragSource, void, { isDragging: boolean }>(
    () => ({
      type: 'SLOT',
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      item: () =>
        isSlotWithItem(item, inventoryType !== InventoryType.SHOP)
          ? {
              inventory: inventoryType,
              item: {
                name: item.name,
                slot: item.slot,
              },
              image: item?.name && `url(${getItemUrl(item) || 'none'}`,
            }
          : null,
      canDrag,
    }),
    [inventoryType, item]
  );

  const [, drop] = useDrop<DragSource, void, unknown>(
    () => ({
      accept: 'SLOT',
      drop: (source) => {
        dispatch(closeTooltip());
        switch (source.inventory) {
          case InventoryType.SHOP:
            onBuy(source, { inventory: inventoryType, item: { slot: item.slot } });
            break;
          case InventoryType.CRAFTING:
            onCraft(source, { inventory: inventoryType, item: { slot: item.slot } });
            break;
          default:
            onDrop(source, { inventory: inventoryType, item: { slot: item.slot } });
            break;
        }
      },
      canDrop: (source) =>
        (source.item.slot !== item.slot || source.inventory !== inventoryType) &&
        inventoryType !== InventoryType.SHOP &&
        inventoryType !== InventoryType.CRAFTING,
    }),
    [inventoryType, item]
  );

  useNuiEvent('refreshSlots', (data: { items?: ItemsPayload | ItemsPayload[] }) => {
    if (!isDragging && !data.items) return;
    if (!Array.isArray(data.items)) return;

    const itemSlot = data.items.find(
      (dataItem) => dataItem.item.slot === item.slot && dataItem.inventory === inventoryId
    );

    if (!itemSlot) return;

    manager.dispatch({ type: 'dnd-core/END_DRAG' });
  });

  const connectRef = (element: HTMLDivElement | null) => {
    if (element) drag(drop(element));
  };

  const handleContext = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (inventoryType !== 'player' || !isSlotWithItem(item)) return;

    dispatch(openContextMenu({ item, coords: { x: event.clientX, y: event.clientY } }));
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    dispatch(closeTooltip());
    if (timerRef.current) clearTimeout(timerRef.current);
    if (event.ctrlKey && isSlotWithItem(item) && inventoryType !== 'shop' && inventoryType !== 'crafting') {
      onDrop({ item: item, inventory: inventoryType });
    } else if (event.altKey && isSlotWithItem(item) && inventoryType === 'player') {
      onUse(item);
    }
  };

  const refs = useMergeRefs([connectRef, ref]);
  const isDisabled =
    !canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) || !canCraftItem(item, inventoryType);
  const hasItem = isSlotWithItem(item);

  return (
    <div
      ref={refs}
      onContextMenu={handleContext}
      onClick={handleClick}
      data-inventory-type={inventoryType}
      data-slot={item.slot}
      className={`inventory-slot relative rounded-[var(--radius)] border text-card-foreground image-rendering-crisp ${
        isHotbar ? 'overflow-visible' : 'overflow-hidden'
      } border-border ${isEquipped ? 'ring-1 ring-accent' : ''}`}
      style={{
        filter: isDisabled ? 'brightness(80%) grayscale(100%)' : undefined,
        backgroundImage: hasItem ? `url(${getItemUrl(item as SlotWithItem) || 'none'})` : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '7vh',
      }}
    >
      {isHotbar && <HotbarBadge number={item.slot} />}

      {hasItem && (
        <div
          className="item-slot-wrapper relative flex h-full flex-col justify-between"
          onMouseEnter={() => {
            timerRef.current = window.setTimeout(() => {
              dispatch(openTooltip({ item, inventoryType }));
            }, 500) as unknown as number;
          }}
          onMouseLeave={() => {
            dispatch(closeTooltip());
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
          }}
        >
          {item.count !== undefined && item.count > 1 && (
            <span
              className="absolute right-[0.35vh] top-[0.35vh] z-10 inline-flex h-[1.5vh] items-center rounded-[0.25vh] bg-black/55 px-[0.45vh] text-[0.85vh] font-medium tabular-nums text-foreground"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {item.count.toLocaleString('en-us')}x
            </span>
          )}

          <div className="flex-1" />

          <div className="relative z-10 flex items-end justify-between gap-[0.2vh] px-[0.35vh] pb-[0.45vh]">
            <span
              className="max-w-[82%] truncate text-[0.78vh] font-medium leading-tight text-foreground"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {item.metadata?.label ? item.metadata.label : Items[item.name]?.label || item.name}
            </span>
            {item.weight > 0 && (
              <span className="shrink-0 text-[0.9vh] text-muted-foreground">{formatWeight(item.weight)}</span>
            )}
          </div>

          {inventoryType === 'shop' && item?.price !== undefined && item.price > 0 && (
            <div className="absolute bottom-[1.6vh] right-[0.4vh] z-10">
              {item?.currency !== 'money' && item.currency !== 'black_money' && item.currency ? (
                <div className="flex items-center gap-[0.3vh]">
                  <img
                    src={getItemUrl(item.currency) || 'none'}
                    alt=""
                    className="h-[1.6vh] w-auto"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                  <span className="text-[1vh] text-foreground">{item.price.toLocaleString('en-us')}</span>
                </div>
              ) : (
                <span
                  className="text-[1vh] font-medium"
                  style={{ color: item.currency === 'money' || !item.currency ? 'var(--dur-good)' : 'var(--destructive)' }}
                >
                  {Locale.$ || '$'}
                  {item.price.toLocaleString('en-us')}
                </span>
              )}
            </div>
          )}

          {inventoryType !== 'shop' && item?.durability !== undefined && <DurabilityBar percent={item.durability} />}
        </div>
      )}
    </div>
  );
};

export default React.memo(React.forwardRef(InventorySlot));
