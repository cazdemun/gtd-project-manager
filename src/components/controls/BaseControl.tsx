import React, { ReactNode } from 'react';
import { Loader } from '@/app/ui';

import styles from './BaseControl.module.scss';

type BaseProjectControlProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  show?: BaseControlShow;
  loading?: boolean;
};

const BaseControl: React.FC<BaseProjectControlProps> = ({ icon: _icon, loading, show = 'all', ...buttonProps }) => {
  const className = `${styles['control']} ${buttonProps.className ?? ''}`;
  const icon = show === 'onlyIcon' || show === 'all' ? _icon : null;
  const children = show === 'onlyText' || show === 'all' ? buttonProps.children : null;

  return (
    <button className={className} onClick={buttonProps.onClick} {...buttonProps}>
      {loading ? <Loader /> : <>{icon} {children}</>}
    </button>
  );
};

export default BaseControl;