'use client';

import React, { useState } from "react";
import { useSelector } from "@xstate/react";
import { Button, Col, Row } from "@/app/ui";
import { ProjectActor, ProjectUIActor, RecordActor, SourceActor } from "@/app/resources";
import { AppActor } from "@/app/machines/appMachine";
import { getTagsAndCount } from "@/utils";;
import BulkOperationsBar from "./BulkOperationsBar";
import ProjectCard from "./cards/ProjectCard";
import SelectProjectCard from "./cards/SelectProjectCard";
import FilterBar from "./FilterBar";
import { useProjectFilter } from "@/hooks/useProjectFilter";
import { CONFIG_SELECTED_TAB, CONFIG_SHOW_FILTER_BAR_TABBED_PANEL, CONFIG_SHOW_PROJECTS_PANEL } from "@/utils/constants";
import useLocalStorage from "@/hooks/useLocalStorage";

import "@/styles/common.scss"

type ProjectsPanelProps = object;

const ProjectsPanel: React.FC<ProjectsPanelProps> = () => {
  const [showList, setShowList] = useLocalStorage(CONFIG_SHOW_PROJECTS_PANEL, true);

  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const { filterState, setFilterState, filteredProjects } = useProjectFilter(projects, { progressState: 'all', tagState: 'tagless' });

  const selectMode = useSelector(AppActor, (state) => state.matches({ projectsPage: 'select' }));
  const selectedProjects = useSelector(AppActor, (state) => state.context.selectedProjectIds);

  const fetchingProjects = useSelector(ProjectActor, (state) => state.matches('fetching'));

  const expandList = () => {
    setShowList(true);
  }

  const collapseList = () => {
    setShowList(false);
  }

  const addProjects = () => {
    ProjectUIActor.send({ type: 'OPEN_CREATE_MODAL' });
  }

  const selectProject = (projectId: string) => {
    AppActor.send({ type: 'SELECT_PROJECT', projectId });
  };

  const loadProjects = () => {
    SourceActor.send({ type: 'FETCH' })
    ProjectActor.send({ type: 'FETCH' })
    RecordActor.send({ type: 'FETCH' })
  }

  if (!showList) {
    return (
      <>
        <Col gap={10} style={{ textAlign: 'center', flex: 'none' }}>
          <h2>Projects</h2>
          <button onClick={expandList}>Show list</button>
          <Button onClick={loadProjects} loading={fetchingProjects}>Load projects</Button>
          <button onClick={addProjects}>Add projects</button>
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
        <button onClick={addProjects}>Add projects</button>
        <Button onClick={loadProjects} loading={fetchingProjects}>Load projects</Button>
        <button onClick={collapseList}>Hide list</button>
      </Row>
      <hr />
      <div>
        {filteredProjects
          .sort((a, b) => selectMode ? (a.done ?? 0) - (b.done ?? 0) : 0)
          .map((project, i) => (
            selectMode ? (
              <SelectProjectCard
                key={i}
                project={project}
                selected={selectedProjects.includes(project._id)}
                onSelect={selectProject}
              />
            ) : (<ProjectCard key={i} project={project} showCardHeaderTags />)
          ))}
      </div>
    </Col>
  );
};

type TabsPanelProps = object

const TabsPanel: React.FC<TabsPanelProps> = () => {
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const { filterState, setFilterState, filteredProjects } = useProjectFilter(projects, { progressState: 'pending' });
  const [tags, pendingTags, doneTags, incubatedTags, overallTags] = getTagsAndCount(projects, filterState.doneDate);

  const [tagSelected, setTagSelected] = useLocalStorage<string | undefined>(CONFIG_SELECTED_TAB, undefined);
  const [sortByDone, setSortByDone] = useState(false);

  const selectMode = useSelector(AppActor, (state) => state.matches({ projectsPage: 'select' }));
  const selectedProjects = useSelector(AppActor, (state) => state.context.selectedProjectIds);

  const handleProjectSelect = (projectId: string) => {
    AppActor.send({ type: 'SELECT_PROJECT', projectId });
  };

  const toogleSortByDone = () => {
    setSortByDone((prev) => !prev);
  }

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

  const addProjects = () => {
    ProjectUIActor.send({ type: 'OPEN_CREATE_MODAL', createOptions: { defaultTag: tagSelected } });
  }


  const Tabs = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0px', rowGap: '5px', flex: '1', alignSelf: 'flex-end' }}>
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
    <Col gap={10} style={{ flex: 2, overflow: 'auto' }}>
      <FilterBar
        storageKey={CONFIG_SHOW_FILTER_BAR_TABBED_PANEL}
        filterState={filterState}
        updateFilterState={setFilterState}
        progressStateFilter
      />
      <Col>
        <Row>
          <Tabs />
          <Col style={{ alignSelf: 'flex-start' }}>
            <button disabled={!tagSelected} onClick={addProjects} >Add projects</button>
            <button disabled={!tagSelected} onClick={toogleSortByDone}>
              {sortByDone ? <strong>Sort by done</strong> : 'Sort by done'}
            </button>
          </Col>
        </Row>
        {tagSelectedProjects
          .sort((a, b) => selectMode || sortByDone ? (a.done ?? 0) - (b.done ?? 0) : 0)
          .map((project, i) => (
            selectMode ? (
              <SelectProjectCard
                key={i}
                project={project}
                selected={selectedProjects.includes(project._id)}
                onSelect={handleProjectSelect}
              />
            ) : (<ProjectCard key={i} project={project} orderInfos={tagSelectedProjectsOrderInfo} showCardHeaderTags />)
          ))}
      </Col>
    </Col>
  )
};

type ProjectsPageProps = object

const ProjectsPage: React.FC<ProjectsPageProps> = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <BulkOperationsBar />
      <Row gap={10}>
        <ProjectsPanel />
        <TabsPanel />
      </Row>
    </div >
  );
}

export default ProjectsPage;