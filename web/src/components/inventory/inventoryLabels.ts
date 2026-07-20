import { Locale } from '../../store/locale';

const subtitleKeys: Record<string, string> = {
  drop: 'ui_subtitle_drop',
  newdrop: 'ui_subtitle_newdrop',
  trunk: 'ui_subtitle_trunk',
  glovebox: 'ui_subtitle_glovebox',
  stash: 'ui_subtitle_stash',
  shop: 'ui_subtitle_shop',
  crafting: 'ui_subtitle_crafting',
  container: 'ui_subtitle_container',
  policeevidence: 'ui_subtitle_policeevidence',
  player: 'ui_subtitle_player',
};

export function getInventorySubtitle(type: string): string {
  const key = subtitleKeys[type];
  if (key && Locale[key]) return Locale[key];
  return Locale.ui_subtitle_external;
}
