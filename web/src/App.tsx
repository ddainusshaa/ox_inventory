import InventoryComponent from './components/inventory';
import { useEffect } from 'react';
import useNuiEvent from './hooks/useNuiEvent';
import { Items } from './store/items';
import { Locale } from './store/locale';
import { setImagePath } from './store/imagepath';
import { setupInventory, setEquippedSlot } from './store/inventory';
import { Inventory } from './typings';
import { useAppDispatch } from './store';
import { debugData } from './utils/debugData';
import DragPreview from './components/utils/DragPreview';
import { fetchNui } from './utils/fetchNui';
import { useDragDropManager } from 'react-dnd';
import KeyPress from './components/utils/KeyPress';
import enLocales from '../../locales/en.json';

function getUiLocales() {
  const uiLocales: Record<string, string> = {};

  for (const [key, value] of Object.entries(enLocales)) {
    if (key.startsWith('ui_') || key === '$' || key === 'ammo_type') {
      uiLocales[key] = value;
    }
  }

  return uiLocales;
}

debugData([
  {
    action: 'init',
    data: {
      locale: getUiLocales(),
      items: {},
      leftInventory: { id: '', type: '', slots: 0, maxWeight: 0, items: [] },
      imagepath: '',
    },
  },
  {
    action: 'setupInventory',
    data: {
      leftInventory: {
        id: 'test',
        type: 'player',
        slots: 50,
        label: 'John Doe',
        weight: 3000,
        maxWeight: 5000,
        items: [
          {
            slot: 1,
            name: 'iron',
            weight: 3000,
            metadata: {
              description: 'Name: John Doe  \n Sex: Male',
              ammo: 3,
            },
            count: 5,
          },
          { slot: 2, name: 'powersaw', weight: 0, count: 1, metadata: { durability: 75 } },
          { slot: 3, name: 'copper', weight: 100, count: 12, metadata: { type: 'Special' } },
          {
            slot: 4,
            name: 'water',
            weight: 100,
            count: 1,
            metadata: { description: 'Generic item description' },
          },
          { slot: 5, name: 'water', weight: 100, count: 1 },
          {
            slot: 6,
            name: 'backwoods',
            weight: 100,
            count: 1,
            metadata: {
              label: 'Russian Cream',
              imageurl: 'https://i.imgur.com/2xHhTTz.png',
            },
          },
        ],
      },
      rightInventory: {
        id: 'shop',
        type: 'newdrop',
        slots: 50,
        label: 'New drop zone',
        weight: 3000,
        maxWeight: 5000,
        items: [
          {
            slot: 1,
            name: 'lockpick',
            weight: 500,
            price: 300,
            metadata: {
              description: 'A simple lockpick that breaks easily',
            },
          },
        ],
      },
    },
  },
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const manager = useDragDropManager();

  useNuiEvent<{
    locale: { [key: string]: string };
    items: typeof Items;
    leftInventory: Inventory;
    imagepath: string;
  }>('init', ({ locale, items, leftInventory, imagepath }) => {
    for (const name in locale) Locale[name] = locale[name];
    for (const name in items) Items[name] = items[name];

    setImagePath(imagepath);
    dispatch(setupInventory({ leftInventory }));
  });

  useNuiEvent('closeInventory', () => {
    manager.dispatch({ type: 'dnd-core/END_DRAG' });
  });

  useNuiEvent<number | null>('setEquippedSlot', (slot) => dispatch(setEquippedSlot(slot ?? null)));

  useEffect(() => {
    void fetchNui('uiLoaded', {});
  }, []);

  return (
    <div className="h-full w-full text-foreground">
      <InventoryComponent />
      <DragPreview />
      <KeyPress />
    </div>
  );
};

addEventListener('dragstart', function (event) {
  event.preventDefault();
});

export default App;
