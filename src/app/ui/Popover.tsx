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

const Popover: React.FC<PopoverProps> = ({ children, content }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState<PopoverCoordinates>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered && triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      const topBeforeCrop = triggerRect.bottom - triggerRect.height - popoverRect.height;
      const leftBeforeCrop = triggerRect.left + triggerRect.width / 2;

      setPosition({
        top: topBeforeCrop < 0 ? triggerRect.bottom + window.scrollY : topBeforeCrop,
        left: leftBeforeCrop + popoverRect.width > window.innerWidth ? triggerRect.left + triggerRect.width / 2 - popoverRect.width : leftBeforeCrop,
      });
    }
  }, [isHovered]);

  useEffect(() => {
    setIsHovered(false);
  }, [content]);

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
