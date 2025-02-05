import React, { } from "react";
import { useTagsColors } from "@/hooks/useTagColors";

type TagBadgeProps = {
  tag: string
};

const TagBadge: React.FC<TagBadgeProps> = ({ tag }) => {
  const { tagsColors } = useTagsColors();
  const color = tagsColors[tag];

  return (color
    ? (
      <div
        style={{
          padding: '2px 5px',
          borderRadius: '5px',
          backgroundColor: color ?? 'gray',
          color: 'gray',
          fontSize: '0.8em',
        }}
      >
        <pre>{tag}</pre>
      </div>
    ) : (<pre>{tag}</pre>)
  );
};

export default TagBadge;