import React from "react";
import { Col, Row } from "@/app/ui";
import { useSelector } from "@xstate/react";
import { ProjectActor } from "@/app/resources";
import { isProjectDone, isProjectIncubated, isProjectPending } from "@/utils";
import LinealDatePicker, { doneFilterDisableNextDay, doneFilterRule } from "./LinealDatePicker";

interface FilterBarProps {
  filterState: FilterState;
  updateFilterState: (arg: SetFilterStateArg) => void;

  progressStateFilter?: boolean;
  tagStateFilter?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filterState,
  updateFilterState,
  progressStateFilter,
  tagStateFilter,
}) => {
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const allLength = projects.length;
  const doneLength = projects.filter(isProjectDone).length;
  const pendingLength = projects.filter(isProjectPending).length;
  const incubatedLength = projects.filter(isProjectIncubated).length;

  const taglessLength = projects.filter((project) => project.tags.length < 1).length;
  const taggedLength = projects.filter((project) => project.tags.length > 0).length;

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

  return (
    <Col gap={8} centerY style={{ flexWrap: "wrap", borderRadius: "5px", border: "1px solid #fff", padding: "8px" }}>
      <h3>Filters</h3>

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

      {/* 
      {tagFilter && (
        <div>
          <h4>Specific Tag</h4>
          <select
            value={filterState.selectedTag ?? ""}
            onChange={(e) => {
              // If empty string is selected, set to undefined
              const newTag = e.target.value || undefined;
              setSelectedTag(newTag);
            }}
          >
            <option value="">-- All Tags --</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )} */}
    </Col>
  );
};

export default FilterBar;