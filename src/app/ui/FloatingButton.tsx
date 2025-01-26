import React from 'react';
import { AiOutlineToTop } from 'react-icons/ai';

type FloatingButtonProps = {
  onClick?: () => void
}

const FloatingButton: React.FC<FloatingButtonProps> = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        width: '50px',
        height: '50px',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgb(15, 15, 15)',
        color: 'white',
        border: '1px white solid',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AiOutlineToTop style={{ width: '25px', height: '25px' }} />
    </button>
  );
};

export default FloatingButton;