type FilterState = {
  progressState?: 'all' | 'done' | 'pending' | 'incubated';
  doneDate?: number;
  tagState?: 'all' | 'tagless' | 'tagged';
  includeTags: string[];
  excludeTags: string[];
}

type SetFilterStateArg =
  | Partial<FilterState>
  | ((prev: FilterState) => FilterState);
