import React, { useRef } from 'react';

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const TextArea: React.FC<TextAreaProps> = (props) => {
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

  return (
    <textarea
      {...props}
      ref={textAreaRef}
      onKeyDown={handleKeyDown}
    />
  );
};

export default TextArea;