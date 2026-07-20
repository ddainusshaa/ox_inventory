import { Inventory, SlotWithItem } from '../../typings';
import React, { Fragment, useMemo } from 'react';
import { Items } from '../../store/items';
import { Locale } from '../../store/locale';
import { useAppSelector } from '../../store';
import ClockIcon from '../utils/icons/ClockIcon';
import { getItemUrl } from '../../helpers';
import Divider from '../utils/Divider';
import Markdown from '../utils/Markdown';

const SlotTooltip: React.ForwardRefRenderFunction<
  HTMLDivElement,
  { item: SlotWithItem; inventoryType: Inventory['type']; style: React.CSSProperties }
> = ({ item, inventoryType, style }, ref) => {
  const additionalMetadata = useAppSelector((state) => state.inventory.additionalMetadata);
  const itemData = useMemo(() => Items[item.name], [item]);
  const ingredients = useMemo(() => {
    if (!item.ingredients) return null;
    return Object.entries(item.ingredients).sort((a, b) => a[1] - b[1]);
  }, [item]);
  const description = item.metadata?.description || itemData?.description;
  const ammoName = itemData?.ammoName && Items[itemData?.ammoName]?.label;

  const wrapperClass =
    'pointer-events-none flex min-w-[20vh] max-w-[24vh] flex-col gap-[0.5vh] rounded-[var(--radius)] border border-border bg-popover p-[0.8vh] text-popover-foreground shadow-lg';

  return (
    <>
      {!itemData ? (
        <div className={wrapperClass} ref={ref} style={style}>
          <div className="flex items-center justify-between gap-[0.5vh]">
            <p className="text-[1.3vh] font-medium">{item.name}</p>
          </div>
          <Divider />
        </div>
      ) : (
        <div style={{ ...style }} className={wrapperClass} ref={ref}>
          <div className="flex items-center justify-between gap-[0.5vh]">
            <p className="text-[1.3vh] font-medium">{item.metadata?.label || itemData.label || item.name}</p>
            {inventoryType === 'crafting' ? (
              <div className="flex items-center gap-[0.3vh] text-muted-foreground">
                <ClockIcon />
                <p className="text-[1.1vh]">{(item.duration !== undefined ? item.duration : 3000) / 1000}s</p>
              </div>
            ) : (
              item.metadata?.type && <p className="text-[1.1vh] text-muted-foreground">{item.metadata.type}</p>
            )}
          </div>
          <Divider />
          {description && (
            <div className="pt-[0.3vh]">
              <Markdown content={description} className="text-[1.1vh] text-muted-foreground [&>p]:m-0" />
            </div>
          )}
          {inventoryType !== 'crafting' ? (
            <div className="flex flex-col gap-[0.2vh] text-[1.1vh] text-muted-foreground">
              {item.durability !== undefined && (
                <p>
                  {Locale.ui_durability}: {Math.trunc(item.durability)}
                </p>
              )}
              {item.metadata?.ammo !== undefined && (
                <p>
                  {Locale.ui_ammo}: {item.metadata.ammo}
                </p>
              )}
              {ammoName && (
                <p>
                  {Locale.ammo_type}: {ammoName}
                </p>
              )}
              {item.metadata?.serial && (
                <p>
                  {Locale.ui_serial}: {item.metadata.serial}
                </p>
              )}
              {item.metadata?.components && item.metadata?.components[0] && (
                <p>
                  {Locale.ui_components}:{' '}
                  {(item.metadata?.components).map((component: string, index: number, array: []) =>
                    index + 1 === array.length ? Items[component]?.label : Items[component]?.label + ', '
                  )}
                </p>
              )}
              {item.metadata?.weapontint && (
                <p>
                  {Locale.ui_tint}: {item.metadata.weapontint}
                </p>
              )}
              {additionalMetadata.map((data: { metadata: string; value: string }, index: number) => (
                <Fragment key={`metadata-${index}`}>
                  {item.metadata && item.metadata[data.metadata] && (
                    <p>
                      {data.value}: {item.metadata[data.metadata]}
                    </p>
                  )}
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-[0.4vh] pt-[0.3vh]">
              {ingredients &&
                ingredients.map((ingredient) => {
                  const [ingredientItem, count] = [ingredient[0], ingredient[1]];
                  return (
                    <div className="flex items-center gap-[0.5vh]" key={`ingredient-${ingredientItem}`}>
                      <img
                        src={ingredientItem ? getItemUrl(ingredientItem) : 'none'}
                        alt=""
                        className="h-[2.4vh] w-[2.4vh] object-contain"
                      />
                      <p className="text-[1.1vh] text-muted-foreground">
                        {count >= 1
                          ? `${count}x ${Items[ingredientItem]?.label || ingredientItem}`
                          : count === 0
                            ? `${Items[ingredientItem]?.label || ingredientItem}`
                            : count < 1 && `${count * 100}% ${Items[ingredientItem]?.label || ingredientItem}`}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default React.forwardRef(SlotTooltip);
