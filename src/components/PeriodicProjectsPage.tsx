import { ProjectActor, RecordActor, SourceActor } from '@/app/resources';
import { useSelector } from '@xstate/react';
import React, { useState } from 'react';
import { isValid, parse } from 'date-fns';
import { DATE_FORMAT, isBeforeByDay } from '@/utils/dates';
import { Button, Col, Row } from '@/app/ui';
import { getNextDate, wasPeriodicDoneToday, isPeriodicFuture, isPeriodicPastDue, isPeriodicToday, isPeriodicUncategorized } from '@/utils';
import PeriodicCard from './cards/PeriodicCard';
import ProjectCard from './cards/ProjectCard';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CONFIG_PERIODICS_PAGE_FILTER, CONFIG_SHOW_FILTER_BAR_PERIODIC_PAGE, CONFIG_SHOW_PAST_PROJECTS } from '@/utils/constants';
import { LuArrowLeftToLine, LuArrowRightToLine } from 'react-icons/lu';
import { useProjectFilter } from '@/hooks/useProjectFilter';
import FilterBar from './FilterBar';
import BulkOperationsBar from './BulkOperationsBar';
import SelectProjectCard from './cards/SelectProjectCard';
import { AppActor } from '@/app/machines/appMachine';

type DateConverterProps = object

export const DateConverter: React.FC<DateConverterProps> = () => {
  const [inputValue, setInputValue] = useState('');
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const parsedDate = parse(value, DATE_FORMAT, new Date());
    if (isValid(parsedDate)) {
      setTimestamp(parsedDate.getTime());
    } else {
      setTimestamp(undefined);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="MM/dd/yyyy"
        style={{ padding: '5px', borderRadius: '4px', border: '1px solid black', width: '150px' }}
      />
      <div>
        <strong>Unix Timestamp: {DATE_FORMAT}</strong> {timestamp !== undefined ? timestamp : 'undefined'}
      </div>
    </div>
  );
};

// sort so period 1 is always on top, but if both periods are not 1, do not sort
const sortDailyProjectsFirst = (a: Project, b: Project) => {
  if (a.periodicData?.period === 1 && b.periodicData?.period !== 1) return -1;
  if (a.periodicData?.period !== 1 && b.periodicData?.period === 1) return 1;
  return 0;
}

const sortPinnedProjectsFirst = (a: Project, b: Project) => {
  const pinnedA = a.periodicData?.pinned ? 1 : 0;
  const pinnedB = b.periodicData?.pinned ? 1 : 0;
  return pinnedB - pinnedA;
}

// Having daily projects on the future column is just clutter, unless they have a valid scheduled
// - Scheduled (if exists) is not expired since it is a future date, and it was cheked beforehand
// This filter is not on isPeriodicFuture, because is a separate concern
const filterNonDailyFutureProject = (project: Project, records: DoneRecord[]) => {
  return (project.periodicData?.period ?? 0) > 1 || (project.periodicData?.scheduled !== undefined && !wasPeriodicDoneToday(project, records))
};

type PeriodicProjectsPageProps = object

const PeriodicProjectsPage: React.FC<PeriodicProjectsPageProps> = () => {
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const projectsMap = useSelector(ProjectActor, ({ context }) => context.resourcesMap);
  const records = useSelector(RecordActor, ({ context }) => context.resources);
  const _periodicProjects = projects.filter((project) => project.periodic);
  const fetchingProjects = useSelector(ProjectActor, (state) => state.matches('fetching'));
  const [showPastProjects, setShowPastProjects] = useLocalStorage(CONFIG_SHOW_PAST_PROJECTS, false);

  const selectMode = useSelector(AppActor, (state) => state.matches({ projectsPage: 'select' }) || state.matches({ periodicProjectsPage: 'select' }));
  const selectedProjects = useSelector(AppActor, (state) => state.context.selectedProjectIds);

  const { filterState, setFilterState, filteredProjects: periodicProjects } = useProjectFilter(_periodicProjects, { progressState: 'pending' }, CONFIG_PERIODICS_PAGE_FILTER);

  // --- Actions ---

  const loadProjects = () => {
    SourceActor.send({ type: 'FETCH' })
    ProjectActor.send({ type: 'FETCH' })
    RecordActor.send({ type: 'FETCH' })
  }

  const selectProject = (projectId: string) => {
    AppActor.send({ type: 'SELECT_PROJECT', projectId });
  };

  const toggleShowPastProjects = () => {
    setShowPastProjects((prev) => !prev);
  }

  const openTagManager = () => {
    AppActor.send({ type: 'OPEN_TAG_MANAGER' });
  }

  // --- Computed values ---

  const unCategorizedProjects = periodicProjects
    .filter((project) => isPeriodicUncategorized(project, records))
    .sort(sortDailyProjectsFirst);

  const futureProjects = periodicProjects
    .filter((project) => isPeriodicFuture(project, records))
    .filter((project) => filterNonDailyFutureProject(project, records))
    .sort((a, b) => getNextDate(a, records)! - getNextDate(b, records)!); // getNextDate is guaranteed to be defined since future projects need to have a next date

  const doneTodayProjects = periodicProjects
    .filter((project) => wasPeriodicDoneToday(project, records))
    .sort(sortDailyProjectsFirst)

  const todayProjects = periodicProjects
    .filter((project) => isPeriodicToday(project, records))
    .sort(sortDailyProjectsFirst)
    .sort(sortPinnedProjectsFirst);

  const pastDueProjects = periodicProjects
    .filter((project) => isPeriodicPastDue(project, records))
    .sort(sortDailyProjectsFirst)
    .sort(sortPinnedProjectsFirst);

  const pastProjects = showPastProjects
    ? records
      .filter((record) => isBeforeByDay(record.date, new Date()))
      .map((record) => {
        const project = projectsMap.get(record.projectId);
        if (!project) return undefined;
        return { ...project, recordDate: record.date };
      }).filter((project): project is Project & { recordDate: number } => project !== undefined)
      .sort((a, b) => b.recordDate - a.recordDate)
    : [];

  // Phantom Projects will help debug missing projects, tags or incorrect filters
  const uniqueIds = new Set<string>([
    ...unCategorizedProjects.map((project) => project._id),
    ...futureProjects.map((project) => project._id),
    ...doneTodayProjects.map((project) => project._id),
    ...todayProjects.map((project) => project._id),
    ...pastDueProjects.map((project) => project._id),
  ]);

  const phantomProjects = projects.filter((project) => !uniqueIds.has(project._id));

  return (
    <Col gap={10} style={{ padding: '20px' }}>
      <BulkOperationsBar />
      <FilterBar storageKey={CONFIG_SHOW_FILTER_BAR_PERIODIC_PAGE} filterState={filterState} updateFilterState={setFilterState} tagsStateFilter />
      <Row gap={10}>
        <Button onClick={loadProjects} loading={fetchingProjects}>Load projects</Button>
        <Button onClick={openTagManager}>Open tag manager</Button>
      </Row>
      <Row gap={10}>
        {showPastProjects ? (
          <Col gap={10} style={{ flex: 1 }}>
            <Row centerY>
              <h3 style={{ flex: 1 }}>Past Projects</h3>
              <Button className='icon-button' onClick={toggleShowPastProjects}><LuArrowLeftToLine /></Button>
            </Row>
            <div>
              {pastProjects.map((project, index) => (
                <PeriodicCard
                  key={`${project._id}-${index}`}
                  project={project}
                  showCardHeaderTags
                  showProgressControls={false}
                  recordDate={project.recordDate}
                />
              ))}
            </div>
          </Col>
        ) : (
          <Col gap={10} style={{ flex: 0 }}>
            <Button className='icon-button' onClick={toggleShowPastProjects}><LuArrowRightToLine /></Button>
          </Col>
        )}
        <hr />
        <Col gap={10} style={{ flex: 1 }}>
          <h3>Past Due Projects</h3>
          <div>
            {pastDueProjects.map((project) => (
              <PeriodicCard key={project._id} project={project} showCardHeaderTags showDaysUntilNextDate showPinControl />
            ))}
          </div>
        </Col>
        <Col gap={10} style={{ flex: 1 }}>
          <h3>Today Projects</h3>
          <div>
            {todayProjects.map((project) => (
              <PeriodicCard key={project._id} project={project} showCardHeaderTags showPinControl />
            ))}
          </div>
        </Col>
        <Col gap={10} style={{ flex: 1 }}>
          <h3>Today Done Projects</h3>
          <div>
            {doneTodayProjects.map((project) => (
              <PeriodicCard key={project._id} project={project} showCardHeaderTags />
            ))}
          </div>
        </Col>
        <hr />
        <Col gap={10} style={{ flex: 1 }}>
          <h3>Future Projects</h3>
          <div>
            {futureProjects.map((project) => (
              <PeriodicCard key={project._id} project={project} showCardHeaderTags showDaysUntilNextDate />
            ))}
          </div>
        </Col>
        <hr />
        <Col gap={10} style={{ flex: 1 }}>
          <h3>Uncategorized Projects</h3>
          <div>
            {unCategorizedProjects.map((project) =>
              selectMode ? (
                <SelectProjectCard
                  key={project._id}
                  project={project}
                  selected={selectedProjects.includes(project._id)}
                  onSelect={selectProject}
                />
              ) : (
                <PeriodicCard key={project._id} project={project} showCardHeaderTags showProgressControls={false} />
              ))}
          </div>
        </Col>
      </Row >
      <Col gap={10}>
        <h2>Projects not Present in Columns</h2>
        <div>
          {phantomProjects.map((project) => (
            <ProjectCard key={project._id} project={project} showCardHeaderTags debug />
          ))}
        </div>
      </Col>
    </Col>
  );
};

export default PeriodicProjectsPage;