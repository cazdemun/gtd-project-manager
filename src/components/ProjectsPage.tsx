'use client';

import React, { useState } from "react";
import { useSelector } from "@xstate/react";
import { FloatingButton, Button } from "@/app/ui";
import { ProjectActor, SourceActor } from "@/app/resources";
import { isDoneDate } from "@/utils/dates";
import ProjectView from "./ProjectView";
import { getTagsAndCount, isProjectDone, isProjectIncubated } from "@/utils";
import ProjectUpdateModal from "./ProjectUpdateModal";
import LinealDatePicker from "./LinealDatePicker";

import "@/styles/common.scss"

type TagFilterState = {
  state: 'tagless' | 'tagged' | 'all';
  label: string;
}

const tagFilterStates: Record<TagFilterState['state'], TagFilterState> = {
  all: { state: 'all', label: 'All' },
  tagless: { state: 'tagless', label: 'Tagless' },
  tagged: { state: 'tagged', label: 'Tagged' },
}

type TagFilterStateButtonsProps = {
  currentFilter: TagFilterState;
  onClick: (filterState: TagFilterState) => void;
};

const TagFilterStateButtons: React.FC<TagFilterStateButtonsProps> = ({ currentFilter, onClick }) => {
  return (
    <>
      {Object.values(tagFilterStates).map((filterState) => (
        <button
          key={filterState.state}
          onClick={() => onClick(filterState)}
        >
          {`${filterState.label} ${currentFilter.state === filterState.state ? '(✔)' : ''}`}
        </button>
      ))}
    </>
  );
};

type ProgressFilterState = {
  state: 'all' | 'done' | 'pending' | 'incubated';
  label: string;
  disabled?: boolean;
}

const doneFilterStates: Record<ProgressFilterState['state'], ProgressFilterState> = {
  all: { state: 'all', label: 'All' },
  done: { state: 'done', label: 'Done' },
  pending: { state: 'pending', label: 'Pending' },
  incubated: { state: 'incubated', label: 'Incubated' },
}

const isProgressState = (state: ProgressFilterState['state'], project: Project): boolean => {
  if (state === 'all') {
    return true;
  } else if (state === 'done') {
    return isProjectDone(project);
  } else if (state === 'incubated') {
    return isProjectIncubated(project);
  } else if (state === 'pending') {
    return !(isProjectDone(project) || isProjectIncubated(project));
  }
  return false;
}

type DoneFilterStateButtonsProps = {
  currentFilter: ProgressFilterState;
  onClick: (filterState: ProgressFilterState) => void;
};

const DoneFilterStateButtons: React.FC<DoneFilterStateButtonsProps> = ({ currentFilter, onClick }) => {
  return (
    <>
      {Object.values(doneFilterStates).map((filterState) => (
        <button
          key={filterState.state}
          onClick={() => onClick(filterState)}
          disabled={filterState.disabled}
        >
          {`${filterState.label} ${currentFilter.state === filterState.state ? '(✔)' : ''}`}
        </button>
      ))}
    </>
  );
};

type ProjectsListProps = {
  projects: Project[];
  collapsed?: boolean;
  onHide?: () => void;
  onShow?: () => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, collapsed, onHide, onShow }) => {
  const fetchingProjects = useSelector(ProjectActor, (state) => state.matches('fetching'));

  const collapseList = () => {
    onHide?.();
  }

  const expandList = () => {
    onShow?.();
  }

  const loadProjects = () => {
    SourceActor.send({ type: 'FETCH' })
    ProjectActor.send({ type: 'FETCH' })
  }

  if (collapsed) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'center',
        }}>
        <h2>Projects</h2>
        <button onClick={expandList}>Show list</button>
        <Button onClick={loadProjects} loading={fetchingProjects}>Load projects</Button>
        <button disabled>Add project</button>
      </div>
    );
  }

  return (
    <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <h2 style={{ flex: '1' }}>Projects</h2>
        <button disabled>Add project</button>
        <Button onClick={loadProjects} loading={fetchingProjects}>Load projects</Button>
        <button onClick={collapseList}>Hide list</button>
      </div>
      <hr />
      <div>
        {projects.map((project, i) => (<ProjectView key={i} project={project} showHeaderTags />))}
      </div>
    </div>
  );
};

type ProjectsPageProps = object

const ProjectsPage: React.FC<ProjectsPageProps> = () => {
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const [dateFilter, setDateFilter] = useState<number | undefined>(undefined);
  const [tags, pendingTags, doneTags, incubatedTags, overallTags] = getTagsAndCount(projects, dateFilter);

  const [doneFilter, setDoneFilter] = useState<ProgressFilterState>(doneFilterStates['pending']);
  const [tagFilter, setTagFilter] = useState<TagFilterState>(tagFilterStates['tagless']);

  const [tagSelected, setTagSelected] = useState<string | undefined>(undefined);
  const [collapsedList, setCollapsedList] = useState(false);

  const getTagNumberByProgress = (tag: string, progress: ProgressFilterState['state']): number => {
    if (progress === 'done') {
      return doneTags[tag] ?? 0;
    } else if (progress === 'incubated') {
      return incubatedTags[tag] ?? 0;
    } else if (progress === 'pending') {
      return pendingTags[tag] ?? 0;
    } else {
      return overallTags[tag] ?? 0;
    }
  }

  const commonFilteredProjects = projects
    .filter((project) => isProgressState(doneFilter.state, project))
    .filter((project) => isDoneDate(dateFilter, project.done))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const filteredProjects = commonFilteredProjects
    .filter((project) => {
      if (tagFilter.state === 'all') {
        return true;
      } else if (tagFilter.state === 'tagless') {
        return project.tags.length === 0;
      } else {
        return project.tags.length > 0;
      }
    })

  const tagSelectedProjects = commonFilteredProjects
    .filter((project) => {
      if (tagSelected === undefined) {
        return false;
      } else {
        return project.tags.includes(tagSelected);
      }
    });

  const tagSelectedProjectsOrderInfo = tagSelectedProjects
    .map((project, index) => ({ _id: project._id, order: project.order, index }))

  const selectTag = (tag: string) => {
    if (tagSelected === tag) setTagSelected(undefined);
    else setTagSelected(tag);
  }

  const Tabs = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '10px', rowGap: '5px' }}>
      {tags.map((tag, i) => (
        <div key={i} onClick={() => selectTag(tag)} style={{ cursor: 'pointer' }}>
          <button
            style={{ padding: '10px', backgroundColor: tagSelected === tag ? 'gray' : 'black', color: 'white', borderRadius: ' 5px 5px 0px 0px' }}
          >
            {`${tag} (${getTagNumberByProgress(tag, doneFilter.state)})`}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2>Filters</h2>
        <hr />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Tagged status:</span>
          <TagFilterStateButtons currentFilter={tagFilter} onClick={setTagFilter} />
          <span>Progress status:</span>
          <DoneFilterStateButtons currentFilter={doneFilter} onClick={setDoneFilter} />
          {doneFilter.state === 'done' && (
            <>
              <span>Done date:</span>
              <LinealDatePicker initialValue={dateFilter} onValueChange={setDateFilter} />
            </>
          )}
        </div>
      </div>
      <hr />
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: collapsedList ? 'none' : '1' }}>
          <ProjectsList
            projects={filteredProjects}
            collapsed={collapsedList}
            onHide={() => setCollapsedList(true)}
            onShow={() => setCollapsedList(false)}
          />
        </div>
        {collapsedList && <hr />}
        <div style={{ flex: 2, overflow: 'auto' }}>
          <Tabs />
          {tagSelectedProjects.map((project, i) => (<ProjectView key={i} project={project} orderInfo={tagSelectedProjectsOrderInfo} showHeaderTags />))}
        </div>
      </div>
      <FloatingButton />
      <ProjectUpdateModal />
    </div >
  );
}

export default ProjectsPage;