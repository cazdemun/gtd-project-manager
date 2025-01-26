import React from 'react';

type ColProps = {
  centerX?: boolean | React.CSSProperties['alignItems'];
  centerY?: boolean | React.CSSProperties['justifyContent'];
  gap?: number | [number, number];
  reversed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const Col: React.FC<ColProps> = ({
  centerX,
  centerY,
  gap,
  reversed,
  className,
  style,
  children,
}) => {
  const computedAlignItems = centerX === true ? 'center' : centerX === false ? undefined : centerX;
  const computedJustifyContent = centerY === true ? 'center' : centerY === false ? undefined : centerY;
  const flexDirection = reversed ? 'column-reverse' : 'column';

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

export default Col;