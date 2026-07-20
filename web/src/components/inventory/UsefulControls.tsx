import { Locale } from '../../store/locale';
import React from 'react';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';

interface Props {
  infoVisible: boolean;
  setInfoVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const UsefulControls: React.FC<Props> = ({ infoVisible, setInfoVisible }) => {
  const { refs, context } = useFloating({
    open: infoVisible,
    onOpenChange: setInfoVisible,
  });

  const dismiss = useDismiss(context, {
    outsidePressEvent: 'mousedown',
  });

  const { isMounted, styles } = useTransitionStyles(context);

  const { getFloatingProps } = useInteractions([dismiss]);

  return (
    <>
      {isMounted && (
        <FloatingPortal>
          <FloatingOverlay
            lockScroll
            className="fixed inset-0 z-50 bg-black"
            data-open={infoVisible}
            style={{ ...styles, backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
          >
            <FloatingFocusManager context={context}>
              <div
                ref={refs.setFloating}
                {...getFloatingProps()}
                className="absolute left-1/2 top-1/2 flex w-[45vh] -translate-x-1/2 -translate-y-1/2 flex-col gap-[1.5vh] rounded-[var(--radius)] border border-border bg-card p-[1.6vh] text-card-foreground shadow-xl"
                style={styles}
              >
                <div className="flex w-full items-center justify-between">
                  <p className="text-[1.6vh] font-semibold">{Locale.ui_usefulcontrols}</p>
                  <button
                    type="button"
                    className="flex h-[2.5vh] w-[2.5vh] items-center justify-center rounded-[var(--radius)] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setInfoVisible(false)}
                    aria-label={Locale.ui_close}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[1.4vh] w-[1.4vh] fill-current" viewBox="0 0 400 528">
                      <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-[1.2vh] text-[1.2vh] text-muted-foreground">
                  <p>
                    <kbd className="mr-[0.5vh] rounded-[var(--radius-sm)] border border-border bg-muted px-[0.5vh] py-[0.2vh] font-mono text-[1vh] text-foreground">
                      RMB
                    </kbd>
                    {Locale.ui_rmb}
                  </p>
                  <p>
                    <kbd className="mr-[0.5vh] rounded-[var(--radius-sm)] border border-border bg-muted px-[0.5vh] py-[0.2vh] font-mono text-[1vh] text-foreground">
                      ALT + LMB
                    </kbd>
                    {Locale.ui_alt_lmb}
                  </p>
                  <p>
                    <kbd className="mr-[0.5vh] rounded-[var(--radius-sm)] border border-border bg-muted px-[0.5vh] py-[0.2vh] font-mono text-[1vh] text-foreground">
                      CTRL + LMB
                    </kbd>
                    {Locale.ui_ctrl_lmb}
                  </p>
                  <p>
                    <kbd className="mr-[0.5vh] rounded-[var(--radius-sm)] border border-border bg-muted px-[0.5vh] py-[0.2vh] font-mono text-[1vh] text-foreground">
                      SHIFT + Drag
                    </kbd>
                    {Locale.ui_shift_drag}
                  </p>
                  <p>
                    <kbd className="mr-[0.5vh] rounded-[var(--radius-sm)] border border-border bg-muted px-[0.5vh] py-[0.2vh] font-mono text-[1vh] text-foreground">
                      CTRL + SHIFT + LMB
                    </kbd>
                    {Locale.ui_ctrl_shift_lmb}
                  </p>
                </div>
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </>
  );
};

export default UsefulControls;
