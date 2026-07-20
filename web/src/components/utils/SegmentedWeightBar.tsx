import React from 'react';

const SegmentedWeightBar: React.FC<{ percent: number; segments?: number }> = ({ percent, segments = 10 }) => {
  const filled = Math.min(segments, Math.ceil((Math.max(0, Math.min(100, percent)) / 100) * segments));

  return (
    <div className="flex w-full gap-[0.25vh]">
      {Array.from({ length: segments }, (_, index) => (
        <div
          key={index}
          className="h-[0.75vh] min-w-0 flex-1 rounded-[var(--radius-sm)]"
          style={{ backgroundColor: index < filled ? 'var(--brand)' : 'var(--muted)' }}
        />
      ))}
    </div>
  );
};

export default SegmentedWeightBar;
