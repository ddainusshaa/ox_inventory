import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import useNuiEvent from '../../hooks/useNuiEvent';
import useQueue from '../../hooks/useQueue';
import { Locale } from '../../store/locale';
import { getItemUrl } from '../../helpers';
import { SlotWithItem } from '../../typings';
import { Items } from '../../store/items';

interface ItemNotificationProps {
  item: SlotWithItem;
  text: string;
}

interface UiStatePayload {
  vehicle?: boolean;
}

export const ItemNotificationsContext = React.createContext<{
  add: (item: ItemNotificationProps) => void;
} | null>(null);

export const useItemNotifications = () => {
  const itemNotificationsContext = useContext(ItemNotificationsContext);
  if (!itemNotificationsContext) throw new Error(`ItemNotificationsContext undefined`);
  return itemNotificationsContext;
};

const ItemNotification = React.forwardRef(
  (props: { item: ItemNotificationProps; style?: React.CSSProperties }, ref: React.ForwardedRef<HTMLDivElement>) => {
    const slotItem = props.item.item;
    const label = slotItem.metadata?.label || Items[slotItem.name]?.label || slotItem.name;

    return (
      <div
        ref={ref}
        className="overlay-slot"
        style={{
          backgroundImage: `url(${getItemUrl(slotItem) || 'none'})`,
          ...props.style,
        }}
      >
        <div className="absolute left-0 right-0 top-[0.45vh] z-10 px-[0.35vh] text-center">
          <p
            className="text-[0.72vh] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {props.item.text}
          </p>
        </div>

        <div className="relative flex h-full flex-col justify-end">
          <div className="relative z-10 px-[0.35vh] pb-[0.45vh]">
            <p
              className="truncate text-[0.78vh] font-medium leading-tight text-foreground"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {label}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export const ItemNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasBottomRightHud, setHasBottomRightHud] = useState(false);
  const queue = useQueue<{
    id: number;
    item: ItemNotificationProps;
    ref: React.RefObject<HTMLDivElement | null>;
  }>();

  const add = (item: ItemNotificationProps) => {
    const ref = React.createRef<HTMLDivElement>();
    const notification = { id: Date.now(), item, ref: ref };

    queue.add(notification);

    const timeout = setTimeout(() => {
      queue.remove();
      clearTimeout(timeout);
    }, 2500);
  };

  useNuiEvent<[item: SlotWithItem, text: string, count?: number]>('itemNotify', ([item, text, count]) => {
    const label = Locale[text] || text;
    add({ item: item, text: count ? `${label} ${count}x` : label });
  });

  useNuiEvent<UiStatePayload>('setUiState', (state) => {
    setHasBottomRightHud(state.vehicle === true);
  });

  return (
    <ItemNotificationsContext.Provider value={{ add }}>
      {children}
      {createPortal(
        <TransitionGroup
          className={`item-notification-container${hasBottomRightHud ? ' item-notification-container--hud' : ''}`}
        >
          {queue.values.map((notification, index) => (
            <CSSTransition
              key={`item-notification-${notification.id}-${index}`}
              nodeRef={notification.ref}
              classNames="transition-fade"
              timeout={250}
            >
              <ItemNotification item={notification.item} ref={notification.ref} />
            </CSSTransition>
          ))}
        </TransitionGroup>,
        document.body
      )}
    </ItemNotificationsContext.Provider>
  );
};
