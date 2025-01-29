import React, { useEffect, useRef } from 'react';

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  focus?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({ focus, ...props }) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (textAreaRef.current) {
        const textarea = textAreaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Insert tab character
        const value = textarea.value;
        textarea.value = value.substring(0, start) + '\t' + value.substring(end);

        // Move the cursor after the tab
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }
    }
    props.onKeyDown?.(e);
  };

  useEffect(() => {
    if (focus && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [focus]);

  return (
    <textarea
      {...props}
      ref={textAreaRef}
      onKeyDown={handleKeyDown}
    />
  );
};

export default TextArea;