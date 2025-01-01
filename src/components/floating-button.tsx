import React from 'react';

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
        padding: '10px 20px',
        backgroundColor: 'rgb(15, 15, 15)',
        color: 'white',
        border: '1px white solid',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      }}
    >
      ↑
    </button>
  );
};

export default FloatingButton;