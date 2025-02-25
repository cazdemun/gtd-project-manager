import React from 'react';
import './Modal.scss';

type ModalProps = {
  visible: boolean;
  width?: number | string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
};

const Modal: React.FC<ModalProps> = ({ title, visible, children, footer, width, onClose }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: width ?? '500px' }}>
        <div className="modal-body">
          {title && (
            <>
              {title}
              < hr />
            </>
          )}
          {children}
          <hr />
          {footer}
        </div>
      </div>
    </div>
  );
};

export default Modal;