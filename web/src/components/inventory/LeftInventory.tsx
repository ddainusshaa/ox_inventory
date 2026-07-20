import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import { selectLeftInventory } from '../../store/inventory';
import { Locale } from '../../store/locale';

const LeftInventory: React.FC = () => {
  const leftInventory = useAppSelector(selectLeftInventory);

  return (
    <InventoryGrid
      inventory={leftInventory}
      panelTitle={Locale.ui_pocket}
      panelSubtitle={Locale.ui_pocket_subtitle}
      showSectionLabels
      showPocketIcon
    />
  );
};

export default LeftInventory;
