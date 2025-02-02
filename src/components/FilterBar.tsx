import React from "react";
import { Col, Row } from "@/app/ui";
import { useSelector } from "@xstate/react";
import { ProjectActor } from "@/app/resources";
import { isProjectDone, isProjectIncubated, isProjectPending } from "@/utils";
import LinealDatePicker, { doneFilterDisableNextDay, doneFilterRule } from "./LinealDatePicker";
import useConditionalLocalStorage from "@/hooks/useConditionalLocalStorage";

type TagsFilterComponentProps = {
  filterState: FilterState;
  updateFilterState: (arg: Partial<FilterState>) => void;
};

const TagsFilterComponent: React.FC<TagsFilterComponentProps> = ({
  filterState,
  updateFilterState,
}) => {
  // Retrieve all tags from projects.
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const allTags = [...new Set(projects.flatMap((project) => project.tags))];

  // Compute the available tags:
  // - For "Include", we display all tags that are not excluded.
  // - For "Exclude", we display all tags that are not included.
  const availableIncludeTags = allTags.filter((tag) => !filterState.excludeTags.includes(tag));
  const availableExcludeTags = allTags.filter((tag) => !filterState.includeTags.includes(tag));

  // Toggle a tag's "include" status.
  const toggleIncludeTag = (tag: string) => {
    const tagIsIncluded = filterState.includeTags.includes(tag);
    const newIncludeTags = tagIsIncluded
      ? filterState.includeTags.filter((t) => t !== tag)
      : [...filterState.includeTags, tag]
    const newExcludeTags = filterState.excludeTags.filter((t) => t !== tag);
    updateFilterState({
      // We clear out any tags that are no longer available.
      includeTags: newIncludeTags.filter((t) => allTags.includes(t)),
      excludeTags: newExcludeTags.filter((t) => allTags.includes(t)),
    });
  };

  // Toggle a tag's "exclude" status.
  const toggleExcludeTag = (tag: string) => {
    const tagIsExcluded = filterState.excludeTags.includes(tag);
    const newExcludeTags = tagIsExcluded
      ? filterState.excludeTags.filter((t) => t !== tag)
      : [...filterState.excludeTags, tag];
    const newIncludeTags = filterState.includeTags.filter((t) => t !== tag);
    updateFilterState({
      // We clear out any tags that are no longer available.
      includeTags: newIncludeTags.filter((t) => allTags.includes(t)),
      excludeTags: newExcludeTags.filter((t) => allTags.includes(t)),
    });
  };

  const sortByState = (tagArray: string[]) => (a: string, b: string) => {
    const valueA = tagArray.includes(a) ? 0 : 1
    const valueB = tagArray.includes(b) ? 0 : 1
    return valueA - valueB
  };

  return (
    <Col gap={10}>
      <Row gap={[10, 8]} centerY style={{ padding: '0px 8px', flexWrap: 'wrap' }}>
        <h4>Include Tags:</h4>
        {availableIncludeTags.sort()
          .sort(sortByState(filterState.includeTags))
          .map((tag) => (
            <button key={tag} onClick={() => toggleIncludeTag(tag)}          >
              {filterState.includeTags.includes(tag) ? <strong>{`${tag} (x)`}</strong> : tag}
            </button>
          ))}
      </Row>

      <Row gap={[10, 8]} centerY style={{ padding: '0px 8px', flexWrap: 'wrap' }}>
        <h4>Exclude Tags:</h4>
        {availableExcludeTags.sort()
          .sort(sortByState(filterState.excludeTags))
          .map((tag) => (
            <button key={tag} onClick={() => toggleExcludeTag(tag)}          >
              {filterState.excludeTags.includes(tag) ? <strong>{`${tag} (x)`}</strong> : tag}
            </button>
          ))}
      </Row>
    </Col>
  );
};

interface FilterBarProps {
  filterState: FilterState;
  updateFilterState: (arg: SetFilterStateArg) => void;
  progressStateFilter?: boolean;
  tagStateFilter?: boolean;
  tagsStateFilter?: boolean;
  // This props is for using useLocalStorage hook
  storageKey?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filterState,
  updateFilterState,
  progressStateFilter,
  tagStateFilter,
  tagsStateFilter,
  storageKey,
}) => {
  const [showFilters, setShowFilters] = useConditionalLocalStorage(storageKey, false);

  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const allLength = projects.length;
  const doneLength = projects.filter(isProjectDone).length;
  const pendingLength = projects.filter(isProjectPending).length;
  const incubatedLength = projects.filter(isProjectIncubated).length;

  const taglessLength = projects.filter((project) => project.tags.length < 1).length;
  const taggedLength = projects.filter((project) => project.tags.length > 0).length;

  const toogleShowFilters = () => {
    setShowFilters((prev) => !prev);
  }

  function setProgressStatus(progressState: FilterState['progressState']) {
    updateFilterState({ progressState });
  }

  function setTagStatus(tagState: FilterState['tagState']) {
    updateFilterState({ tagState });
  }

  function setDoneDate(doneDate?: number) {
    updateFilterState({ doneDate });
  }

  function computeWeight<T>(stateProperty: T, stateValue: T) {
    return stateProperty === stateValue ? 'bold' : 'normal';
  }

  if (!showFilters) return (
    <Col gap={8} centerY style={{ flexWrap: "wrap", borderRadius: "5px", border: "1px solid #fff", padding: "8px" }}>
      <h3 onClick={toogleShowFilters} style={{ cursor: "pointer" }}>Filters</h3>
    </Col>
  );

  return (
    <Col gap={8} centerY style={{ flexWrap: "wrap", borderRadius: "5px", border: "1px solid #fff", padding: "8px" }}>
      <h3 onClick={toogleShowFilters} style={{ cursor: "pointer" }}>Filters</h3>
      {progressStateFilter && (
        <Row gap={[10, 8]} centerY style={{ padding: "0px 8px", flexWrap: "wrap" }}>
          <h4>Progress state:</h4>
          <button
            onClick={() => setProgressStatus('all')}
            style={{ fontWeight: computeWeight(filterState.progressState, 'all') }}
          >
            {`All (${allLength})`}
          </button>
          <button
            onClick={() => setProgressStatus('done')}
            style={{ fontWeight: computeWeight(filterState.progressState, 'done') }}
          >
            {`Done (${doneLength})`}
          </button>
          <button
            onClick={() => setProgressStatus('pending')}
            style={{ fontWeight: computeWeight(filterState.progressState, 'pending') }}
          >
            {`Pending (${pendingLength})`}
          </button>
          <button
            onClick={() => setProgressStatus('incubated')}
            style={{ fontWeight: computeWeight(filterState.progressState, 'incubated') }}
          >
            {`Incubated (${incubatedLength})`}
          </button>
          {filterState.progressState === 'done' && (
            <Row gap={[10, 5]} centerY>
              <h4>Done date:</h4>
              <LinealDatePicker
                initialValue={filterState.doneDate}
                onValueChange={setDoneDate}
                rules={[doneFilterRule]}
                disableGoNextDay={doneFilterDisableNextDay}
              />
            </Row>
          )}
        </Row>
      )}

      {tagStateFilter && progressStateFilter && < hr />}
      {tagStateFilter && (
        <Row gap={[10, 8]} centerY style={{ padding: "0px 8px", flexWrap: "wrap" }}>
          <h4>Tag state</h4>
          <button
            onClick={() => setTagStatus('all')}
            style={{ fontWeight: computeWeight(filterState.tagState, 'all') }}
          >
            {`All (${allLength})`}
          </button>
          <button
            onClick={() => setTagStatus('tagless')}
            style={{ fontWeight: computeWeight(filterState.tagState, 'tagless') }}
          >
            {`Tagless (${taglessLength})`}
          </button>
          <button
            onClick={() => setTagStatus('tagged')}
            style={{ fontWeight: computeWeight(filterState.tagState, 'tagged') }}
          >
            {`Tagged (${taggedLength})`}
          </button>
        </Row>
      )}
      {tagsStateFilter && (
        <TagsFilterComponent filterState={filterState} updateFilterState={updateFilterState} />
      )}
    </Col>
  );
};

export default FilterBar;