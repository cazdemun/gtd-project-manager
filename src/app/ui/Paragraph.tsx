import React from 'react';

type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement> & {
  children?: React.ReactNode;
  lineBreak?: boolean;
};

const Paragraph: React.FC<ParagraphProps> = ({ lineBreak, children, ...props }) => {
  if (typeof children !== 'string') {
    return <><p {...props}>{children}</p>{lineBreak && <br />}</>;
  }

  const protocols = ['https', 'http', 'obsidian', 'file'];
  const urlRegex = new RegExp(`((?:${protocols.join('|')}):\\/\\/[^\\s]+)`, 'g');

  const parts = children.split(urlRegex)
    .filter((part) => part.trim() !== '')
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

  return (
    <>
      <p {...props}>{parts}</p>
      {lineBreak && <br />}
    </>
  );
};

export default Paragraph;