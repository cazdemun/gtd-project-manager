import React from 'react';
import './Modal.scss';

type ModalProps = {
  visible: boolean;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
};

const Modal: React.FC<ModalProps> = ({ visible, children, footer, onClose }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          {children}
          <hr />
          {footer}
        </div>
      </div>
    </div>
  );
};

export default Modal;