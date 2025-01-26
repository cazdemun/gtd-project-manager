import React, { useState, ReactNode, useEffect, useRef } from 'react';

import "./Popover.scss";

type PopoverCoordinates = {
  top: number;
  left: number;
};

type PopoverProps = {
  children: ReactNode;
  content: ReactNode;
}

// TODO: Design popover behaviour for mobile devices
const Popover: React.FC<PopoverProps> = ({ children, content }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState<PopoverCoordinates>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered && triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      // If there is no overflow, position the popover on top right (TR) of the trigger
      const topPositionT = triggerRect.bottom - triggerRect.height - popoverRect.height;
      const leftPositionR = triggerRect.left + triggerRect.width / 2;
      
      const doesTopPositionTOverflows = topPositionT < 0;
      const doesLeftPositionROverflows = leftPositionR + popoverRect.width > window.innerWidth;
      
      // If both sides overflow, position the popover on bottom left (BL) of the trigger.
      // If only one overflows, position the popover on the opposite side of the overflow (TL or BR).
      // If even then it overflows then the windows is too small or the popover too big.
      const topPositionB = triggerRect.bottom;
      const leftPositionL = triggerRect.left + triggerRect.width / 2 - popoverRect.width;

      setPosition({
        top: doesTopPositionTOverflows ? topPositionB : topPositionT,
        left: doesLeftPositionROverflows ? leftPositionL : leftPositionR,
      });
    }
  }, [isHovered]);

  useEffect(() => {
    setIsHovered(false);
  }, [content, children]);

  const PopoverContent = () => (
    <div
      ref={popoverRef}
      className="popover-content"
      style={{
        display: 'block',
        top: position.top,
        left: position.left,
      }}
    >
      {content}
    </div>
  );

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="popover-container"
    >
      {children}
      {isHovered && <PopoverContent />}
    </div>
  );
};

export default Popover;
