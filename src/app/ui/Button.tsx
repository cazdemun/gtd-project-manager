import React from 'react';
import Loader from './Loader';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({ loading, children, ...props }) => {
  const buttonClassName = `${loading ? 'icon-button ' : ''}${props.className ?? ''}`.trim();

  return (
    <button {...props} className={buttonClassName} disabled={loading || props.disabled}>
      {loading ? <Loader /> : children}
    </button>
  );
};

export default Button;