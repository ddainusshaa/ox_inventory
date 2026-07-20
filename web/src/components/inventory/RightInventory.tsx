import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import { selectRightInventory } from '../../store/inventory';
import { getInventorySubtitle } from './inventoryLabels';
import { Locale } from '../../store/locale';

const RightInventory: React.FC = () => {
  const rightInventory = useAppSelector(selectRightInventory);
  const isDrop = rightInventory.type === 'drop' || rightInventory.type === 'newdrop';
  const panelTitle =
    rightInventory.label || (isDrop ? Locale.ui_drop || 'Drop' : Locale.ui_storage);

  return (
    <InventoryGrid
      inventory={rightInventory}
      panelTitle={panelTitle}
      panelSubtitle={getInventorySubtitle(rightInventory.type)}
    />
  );
};

export default RightInventory;
