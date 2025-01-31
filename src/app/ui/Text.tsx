import React from 'react';
import Paragraph from './Paragraph';

type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  children?: string;
};

const Text: React.FC<TextProps> = ({ children }) => {
  if (!children || typeof children !== 'string') return <>{children}</>;
  return children.split('\n')
    .filter((line) => line.trim() !== '')
    .map((line, index, arr) => (
      <Paragraph key={index} style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }} lineBreak={index < arr.length - 1}>
        {line}
      </Paragraph>
    ))
};

export default Text;