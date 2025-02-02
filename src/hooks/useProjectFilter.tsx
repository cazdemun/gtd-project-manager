import { isProjectDone, isProjectIncubated, isProjectPending } from "@/utils";
import { isDoneDate } from "@/utils/dates";
import { useState, useMemo } from "react";

export function useProjectFilter(projects: Project[], initialFilterState?: Partial<FilterState>) {
  // A regular useState for the filter state
  const [filterState, _setFilterState] = useState<FilterState>({
    progressState: undefined,
    tagState: undefined,
    // selectedTag: undefined,
    doneDate: undefined,
    includeTags: [],
    excludeTags: [],
    ...initialFilterState,
  });

  // Wrap the setFilterState
  function setFilterState(arg: SetFilterStateArg) {
    _setFilterState((prev) => {
      if (typeof arg === 'function') {
        // If the user passes a function, just call it with the previous state
        return arg(prev);
      } else {
        // If the user passes a partial update object, merge it into the prev state
        return { ...prev, ...arg };
      }
    });
  }

  // Filter your projects in a memo
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        if (filterState.progressState === 'all') return true;
        if (filterState.progressState === 'done') {
          const isDoneOnDateFilter = filterState.doneDate ? isDoneDate(filterState.doneDate, project.done) : true
          return isProjectDone(project) && isDoneOnDateFilter;
        };
        if (filterState.progressState === 'pending') return isProjectPending(project);
        if (filterState.progressState === 'incubated') return isProjectIncubated(project);
        return true;
      })
      .filter((project) => {
        if (filterState.tagState === 'all') return true;
        if (filterState.tagState === 'tagless') return project.tags.length === 0;
        if (filterState.tagState === 'tagged') return project.tags.length > 0;
        return true;
      }).filter((project) => {
        if (filterState.includeTags.length === 0) return true;
        return project.tags.some((tag) => filterState.includeTags.includes(tag));
      }).filter((project) => {
        if (filterState.excludeTags.length === 0) return true;
        return !project.tags.some((tag) => filterState.excludeTags.includes(tag));
      });
  }, [projects, filterState]);

  return {
    filterState,
    setFilterState, // <-- returns our custom setter
    filteredProjects,
  };
}
