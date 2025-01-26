import React, { ReactNode } from 'react';

import styles from './BaseControl.module.scss';

type BaseControlProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  show?: BaseControlShow;
};

const BaseControl: React.FC<BaseControlProps> = ({ icon: _icon, show = 'all', ...buttonProps }) => {
  const className = `${styles['control']} ${buttonProps.className ?? ''}`;
  const icon = show === 'onlyIcon' || show === 'all' ? _icon : null;
  const children = show === 'onlyText' || show === 'all' ? buttonProps.children : null;

  return (
    <button className={className} onClick={buttonProps.onClick} {...buttonProps}>
      {icon} {children}
    </button>
  );
};

export default BaseControl;