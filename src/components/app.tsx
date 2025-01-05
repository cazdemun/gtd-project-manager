'use client';

import React, { useState } from "react";
import { useSelector } from "@xstate/react";
import { FloatingButton, Button } from "@/app/ui";
import { ProjectActor } from "@/app/resources";
import ProjectView from "./ProjectView";
import { getTagsAndCount, isProjectDone } from "@/utils";
import ProjectUpdateModal from "./ProjectUpdateModal";

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

type DoneFilterState = {
  state: 'done' | 'pending' | 'all';
  label: string;
}

const doneFilterStates: Record<DoneFilterState['state'], DoneFilterState> = {
  all: { state: 'all', label: 'All' },
  done: { state: 'done', label: 'Done' },
  pending: { state: 'pending', label: 'Pending' },
}

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



export default function App() {
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const [tags, countedTags] = getTagsAndCount(projects);
  // const tags = [...new Set(projects.map((project) => project.tags).flat())]
  // const countedTags = getCountedTags(projects);
  // const tags = getSortedTags(countedTags);

  const [doneFilter, setDoneFilter] = useState<DoneFilterState>(doneFilterStates['pending']);
  const [tagFilter, setTagFilter] = useState<TagFilterState>(tagFilterStates['tagless']);

  const [tagSelected, setTagSelected] = useState<string | undefined>(undefined);
  const [collapsedList, setCollapsedList] = useState(false);

  const filteredProjects = projects
    .filter((project) => {
      if (tagFilter.state === 'all') {
        return true;
      } else if (tagFilter.state === 'tagless') {
        return project.tags.length === 0;
      } else {
        return project.tags.length > 0;
      }
    })
    .filter((project) => {
      if (doneFilter.state === 'all') {
        return true;
      } else if (doneFilter.state === 'done') {
        return isProjectDone(project);
      } else {
        return !(isProjectDone(project));
      }
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const tagSelectedProjects = filteredProjects
    .filter((project) => {
      if (tagSelected === undefined) {
        return false;
      } else {
        return project.tags.includes(tagSelected);
      }
    });

  const tagSelectedProjectsOrderInfo = tagSelectedProjects
    .map((project, index) => ({ _id: project._id, order: project.order, index }))

  const toggleDoneFilter = () => {
    setDoneFilter((prev) => {
      if (prev.state === 'all') {
        return doneFilterStates['pending'];
      } else if (prev.state === 'pending') {
        return doneFilterStates['done'];
      } else {
        return doneFilterStates['all'];
      }
    });
  }

  const toggleTagFilter = () => {
    setTagFilter((prev) => {
      if (prev.state === 'all') {
        return tagFilterStates['tagless'];
      } else if (prev.state === 'tagless') {
        return tagFilterStates['tagged'];
      } else {
        return tagFilterStates['all'];
      }
    });
  }

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
            {`${tag} (${countedTags[tag] ?? 0})`}
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
          <span>Progress status:</span>
          <button onClick={toggleDoneFilter}>{doneFilter.label}</button>
          <span>Tagged status:</span>
          <button onClick={toggleTagFilter}>{tagFilter.label}</button>
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
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Tabs />
          {tagSelectedProjects.map((project, i) => (<ProjectView key={i} project={project} orderInfo={tagSelectedProjectsOrderInfo} showHeaderTags />))}
        </div>
      </div>
      <FloatingButton />
      <ProjectUpdateModal />
    </div >
  );
}
