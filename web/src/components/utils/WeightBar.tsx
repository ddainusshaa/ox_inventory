import React, { useMemo } from 'react';

const DurabilityBar: React.FC<{ percent: number }> = ({ percent }) => {
  const color = useMemo(() => {
    if (percent >= 50) return 'var(--dur-good)';
    if (percent >= 25) return 'var(--dur-warn)';
    return 'var(--dur-bad)';
  }, [percent]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[0.35vh] overflow-hidden rounded-b-[var(--radius)] bg-muted">
      <div
        className="h-full transition-[width] duration-300 ease-out"
        style={{
          width: `${Math.max(0, Math.min(100, percent))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

export default DurabilityBar;
