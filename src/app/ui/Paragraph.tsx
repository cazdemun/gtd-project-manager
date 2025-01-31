import React from 'react';

type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement> & {
  children?: React.ReactNode;
};

const Paragraph: React.FC<ParagraphProps> = ({ children, ...props }) => {
  if (typeof children !== 'string') {
    return <p {...props}>{children}</p>;
  }

  const protocols = ['https', 'http', 'obsidian', 'file'];
  const urlRegex = new RegExp(`((?:${protocols.join('|')}):\\/\\/[^\\s]+)`, 'g');

  const parts = children.split(urlRegex)
    .map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
            {part}
          </a>
        );
      }
      return part;
    });

  return <p {...props}>{parts}</p>;
};

export default Paragraph;