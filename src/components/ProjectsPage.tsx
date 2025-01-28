'use client';

import React, { useState } from "react";
import { useSelector } from "@xstate/react";
import { Button, Col, Row } from "@/app/ui";
import { ProjectActor, RecordActor, SourceActor } from "@/app/resources";
import { AppActor } from "@/app/machines/appMachine";
import { getTagsAndCount } from "@/utils";;
import BulkOperationsBar from "./BulkOperationsBar";
import ProjectCard from "./ProjectCard";
import BaseProjectCard from "./BaseProjectCard";
import { FilterBar } from "./FilterBar";
import { useProjectFilter } from "@/hooks/useProjectFilter";

import "@/styles/common.scss"

type ProjectsPanelProps = object;

const ProjectsPanel: React.FC<ProjectsPanelProps> = () => {
  const [collapsedList, setCollapsedList] = useState(false);

  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const { filterState, setFilterState, filteredProjects } = useProjectFilter(projects, { progressState: 'all', tagState: 'tagless' });

  const fetchingProjects = useSelector(ProjectActor, (state) => state.matches('fetching'));

  const collapseList = () => {
    setCollapsedList(true);
  }

  const expandList = () => {
    setCollapsedList(false);
  }

  const loadProjects = () => {
    SourceActor.send({ type: 'FETCH' })
    ProjectActor.send({ type: 'FETCH' })
    RecordActor.send({ type: 'FETCH' })
  }

  if (collapsedList) {
    return (
      <>
        <Col gap={10} style={{ textAlign: 'center', flex: 'none' }}>
          <h2>Projects</h2>
          <button onClick={expandList}>Show list</button>
          <Button onClick={loadProjects} loading={fetchingProjects}>Load projects</Button>
          <button disabled>Add project</button>
        </Col>
        <hr style={{ alignSelf: 'stretch' }} />
      </>
    );
  }

  return (
    <Col gap={10} style={{ overflow: 'auto', flex: '1' }}>
      <FilterBar filterState={filterState} updateFilterState={setFilterState} progressStateFilter tagStateFilter />
      <Row gap={10}>
        <h2 style={{ flex: '1' }}>{`Projects (${filteredProjects.length})`}</h2>
        <button disabled>Add project</button>
        <Button onClick={loadProjects} loading={fetchingProjects}>Load projects</Button>
        <button onClick={collapseList}>Hide list</button>
      </Row>
      <hr />
      <div>
        {filteredProjects.map((project, i) => (<ProjectCard key={i} project={project} showCardHeaderTags />))}
      </div>
    </Col>
  );
};

type TabsPanelProps = object

const TabsPanel: React.FC<TabsPanelProps> = () => {
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const { filterState, setFilterState, filteredProjects } = useProjectFilter(projects, { progressState: 'pending' });
  const [tags, pendingTags, doneTags, incubatedTags, overallTags] = getTagsAndCount(projects, filterState.doneDate);

  const [tagSelected, setTagSelected] = useState<string | undefined>(undefined);

  const selectMode = useSelector(AppActor, (state) => state.matches({ projectsPage: 'select' }));
  const selectedProjects = useSelector(AppActor, (state) => state.context.selectedProjectIds);

  const handleProjectSelect = (projectId: string) => {
    AppActor.send({ type: 'SELECT_PROJECT', projectId });
  };

  const getTagNumberByProgress = (tag: string, progress: FilterState['progressState']): number => {
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

  const tagSelectedProjects = filteredProjects
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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
            {`${tag} (${getTagNumberByProgress(tag, filterState.progressState)})`}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <FilterBar filterState={filterState} updateFilterState={setFilterState} progressStateFilter />
      <Col>
        <Tabs />
        {tagSelectedProjects.map((project, i) => (
          selectMode ? (
            <BaseProjectCard key={i} project={project}>
              <Row centerY gap={10}>
                <input
                  type="checkbox"
                  checked={selectedProjects.some((_id) => _id === project._id)}
                  onChange={() => handleProjectSelect(project._id)}
                  style={{ flex: 'none', width: 'auto' }}
                />
                <h4>{project.title}</h4>
                <pre>{project.tags.join(', ')}</pre>
              </Row>
            </BaseProjectCard>
          ) : (<ProjectCard key={i} project={project} orderInfos={tagSelectedProjectsOrderInfo} showCardHeaderTags />)
        ))}
      </Col>
    </>
  )
};

type ProjectsPageProps = object

const ProjectsPage: React.FC<ProjectsPageProps> = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <BulkOperationsBar />
      </div>
      <hr />
      <div style={{ display: 'flex', gap: '10px' }}>
        <ProjectsPanel />
        <div style={{ flex: 2, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TabsPanel />
        </div>
      </div>
    </div >
  );
}

export default ProjectsPage;