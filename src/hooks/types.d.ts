type FilterState = {
  progressState?: 'all' | 'done' | 'pending' | 'incubated';
  doneDate?: number;
  tagState?: 'all' | 'tagless' | 'tagged';
  // selectedTag?: string;
}

type SetFilterStateArg =
  | Partial<FilterState>
  | ((prev: FilterState) => FilterState);
