import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectItemAmount, setItemAmount } from '../../store/inventory';
import { DragSource } from '../../typings';
import { onUse } from '../../dnd/onUse';
import { onGive } from '../../dnd/onGive';
import { Locale } from '../../store/locale';
import UsefulControls from './UsefulControls';

const formatAmount = (n: number) => (n > 0 ? n.toLocaleString('en-US') : '0');
const digitsOnly = (s: string) => s.replace(/\D/g, '');
const countDigitsBefore = (s: string, index: number) => digitsOnly(s.substring(0, index)).length;

const UseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-[1.8vh] w-[1.8vh]" aria-hidden>
    <path
      d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-[1.8vh] w-[1.8vh]" aria-hidden>
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M19 8v6M22 11h-6"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const actionButtonClass =
  'flex h-[3.6vh] w-[3.6vh] items-center justify-center rounded-[var(--radius)] border border-border bg-secondary text-foreground transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground active:translate-y-[0.2vh]';

const InventoryControl: React.FC = () => {
  const itemAmount = useAppSelector(selectItemAmount);
  const dispatch = useAppDispatch();

  const [infoVisible, setInfoVisible] = useState(false);
  const [value, setValue] = useState(formatAmount(itemAmount));
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);

  const [, use] = useDrop<DragSource, void, any>(() => ({
    accept: 'SLOT',
    drop: (source) => {
      source.inventory === 'player' && onUse(source.item);
    },
  }));

  const [, give] = useDrop<DragSource, void, any>(() => ({
    accept: 'SLOT',
    drop: (source) => {
      source.inventory === 'player' && onGive(source.item);
    },
  }));

  const commitValue = (raw: string, cursorIndex: number) => {
    const digitsBefore = countDigitsBefore(raw, cursorIndex);
    const num = parseInt(digitsOnly(raw), 10) || 0;

    setValue(formatAmount(num));
    dispatch(setItemAmount(num));
    cursorRef.current = digitsBefore;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    commitValue(event.target.value, event.target.selectionStart ?? 0);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const el = event.currentTarget;
    const pos = el.selectionStart ?? 0;

    if (pos !== el.selectionEnd) return;

    if (event.key === 'Backspace' && el.value[pos - 1] === ',') {
      event.preventDefault();
      commitValue(el.value.slice(0, pos - 2) + el.value.slice(pos), pos - 2);
    } else if (event.key === 'Delete' && el.value[pos] === ',') {
      event.preventDefault();
      commitValue(el.value.slice(0, pos) + el.value.slice(pos + 2), pos);
    }
  };

  useEffect(() => {
    if (!inputRef.current || cursorRef.current === null) return;
    let newPos = 0;
    let count = 0;

    for (let i = 0; i < value.length && count < cursorRef.current; i++) {
      if (/\d/.test(value[i])) count++;
      newPos++;
    }

    inputRef.current.setSelectionRange(newPos, newPos);
    cursorRef.current = null;
  }, [value]);

  return (
    <>
      <UsefulControls infoVisible={infoVisible} setInfoVisible={setInfoVisible} />

      <div className="flex shrink-0 items-center self-center">
        <div className="flex w-[7vh] flex-col items-center gap-[0.7vh] rounded-[var(--radius)] border border-border bg-card-glass px-[0.8vh] py-[1vh] shadow-lg">
          <input
            className="w-full appearance-none border-0 bg-transparent p-0 text-center text-[1.15vh] font-medium tabular-nums text-foreground outline-none ring-0 [box-shadow:none] focus:outline-none focus:ring-0"
            style={{ fontFamily: 'var(--font-sans)', background: 'transparent' }}
            type="text"
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            min={0}
            aria-label={Locale.ui_item_amount}
          />

          <div className="h-px w-full bg-border" aria-hidden />

          <div className="flex flex-col items-center gap-[0.4vh]">
            <button
              className={actionButtonClass}
              ref={(el) => {
                use(el);
              }}
              aria-label={Locale.ui_use}
              title={Locale.ui_use}
            >
              <UseIcon />
            </button>
            <button
              className={actionButtonClass}
              ref={(el) => {
                give(el);
              }}
              aria-label={Locale.ui_give}
              title={Locale.ui_give}
            >
              <GiveIcon />
            </button>
          </div>
        </div>
      </div>

      <button
        className="fixed bottom-[2.5vh] right-[2.5vh] flex h-[4.5vh] w-[4.5vh] items-center justify-center rounded-[var(--radius)] border border-border bg-secondary text-muted-foreground transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
        onClick={() => setInfoVisible(true)}
        aria-label={Locale.ui_usefulcontrols}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[2vh] w-[2vh] fill-current" viewBox="0 0 524 524">
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
        </svg>
      </button>
    </>
  );
};

export default InventoryControl;
