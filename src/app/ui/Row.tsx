import React from 'react';

type RowProps = {
  centerX?: boolean | React.CSSProperties['justifyContent'];
  centerY?: boolean | React.CSSProperties['alignItems'];
  gap?: number | [number, number];
  reversed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const Row: React.FC<RowProps> = ({
  centerX,
  centerY,
  gap,
  reversed,
  className,
  style,
  children,
}) => {
  const computedAlignItems = centerY === true ? 'center' : centerY === false ? undefined : centerY;
  const computedJustifyContent = centerX === true ? 'center' : centerX === false ? undefined : centerX;
  const flexDirection = reversed ? 'row-reverse' : 'row';

  const gapStyle = Array.isArray(gap) ? { rowGap: gap[1], columnGap: gap[0] } : { gap };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection,
        ...(computedAlignItems !== undefined ? { alignItems: computedAlignItems } : {}),
        ...(computedJustifyContent !== undefined ? { justifyContent: computedJustifyContent } : {}),
        ...gapStyle,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
};

export default Row;