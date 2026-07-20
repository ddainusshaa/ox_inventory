import React from 'react';

const HotbarBadge: React.FC<{ number: number }> = ({ number }) => (
  <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
    <div
      className="flex h-[1.35vh] w-[1.35vh] rotate-45 items-center justify-center"
      style={{
        backgroundColor: 'var(--brand)',
        border: '1px solid rgba(250, 250, 250, 0.85)',
        boxShadow: '0 0 0.25vh rgba(250, 250, 250, 0.35)',
      }}
    >
      <span
        className="-rotate-45 text-[0.72vh] font-semibold leading-none"
        style={{ color: 'var(--brand-foreground)', fontFamily: 'var(--font-sans)' }}
      >
        {number}
      </span>
    </div>
  </div>
);

export default HotbarBadge;
