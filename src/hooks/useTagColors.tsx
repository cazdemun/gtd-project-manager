import React, { createContext, useContext } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CONFIG_TAG_COLORS } from '@/utils/constants';

type TagsColorsContextType = {
  tagsColors: TagsColors;
  setTagsColors: (colors: TagsColors | ((prev: TagsColors) => TagsColors)) => void;
};

const TagsColorsContext = createContext<TagsColorsContextType | undefined>(undefined);

export const TagsColorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tagsColors, setTagsColors] = useLocalStorage<TagsColors>(CONFIG_TAG_COLORS, {});

  return (
    <TagsColorsContext.Provider value={{ tagsColors, setTagsColors }}>
      {children}
    </TagsColorsContext.Provider>
  );
};

export const useTagsColors = () => {
  const context = useContext(TagsColorsContext);
  if (!context) {
    throw new Error('useTagsColors must be used within a TagsColorsProvider');
  }
  return context;
};