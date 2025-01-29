import { ProjectActor, RecordActor, SourceActor } from '@/app/resources';
import { useSelector } from '@xstate/react';
import React, { useState } from 'react';
import { isValid, parse } from 'date-fns';
import { DATE_FORMAT, isBeforeByDay } from '@/utils/dates';
import { Button, Col } from '@/app/ui';
import { getNextDate, wasPeriodicDoneToday, isPeriodicFuture, isPeriodicPastDue, isPeriodicToday, isPeriodicUncategorized } from '@/utils';
import PeriodicCard from './cards/PeriodicCard';
import ProjectCard from './cards/ProjectCard';

type DateConverterProps = object

const DateConverter: React.FC<DateConverterProps> = () => {
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
  const periodicProjects = projects.filter((project) => project.periodic);
  const fetchingProjects = useSelector(ProjectActor, (state) => state.matches('fetching'));

  const loadProjects = () => {
    SourceActor.send({ type: 'FETCH' })
    ProjectActor.send({ type: 'FETCH' })
    RecordActor.send({ type: 'FETCH' })
  }

  const unCategorizedProjects = periodicProjects
    .filter((project) => isPeriodicUncategorized(project, records))
    .sort(sortDailyProjectsFirst);

  const futureProjects = periodicProjects
    .filter((project) => isPeriodicFuture(project, records))
    .filter((project) => filterNonDailyFutureProject(project, records))
    // getNextDate is guaranteed to be defined since future projects need to have a next date
    .sort((a, b) => getNextDate(a, records)! - getNextDate(b, records)!);

  const doneTodayProjects = periodicProjects
    .filter((project) => wasPeriodicDoneToday(project, records))
    .sort(sortDailyProjectsFirst)

  const todayProjects = periodicProjects
    .filter((project) => isPeriodicToday(project, records))
    .sort(sortDailyProjectsFirst);

  const pastDueProjects = periodicProjects
    .filter((project) => isPeriodicPastDue(project, records))
    .sort(sortDailyProjectsFirst);

  const uniqueIds = new Set<string>([
    ...unCategorizedProjects.map((project) => project._id),
    ...futureProjects.map((project) => project._id),
    ...doneTodayProjects.map((project) => project._id),
    ...todayProjects.map((project) => project._id),
    ...pastDueProjects.map((project) => project._id),
  ]);

  // Phantom Projects will help debug missing projects, tags or incorrect filters
  const phantomProjects = projects.filter((project) => !uniqueIds.has(project._id));

  const pastProjects = records
    .filter((record) => isBeforeByDay(record.date, new Date()))
    .map((record) => {
      const project = projectsMap.get(record.projectId);
      if (!project) return undefined;
      return { ...project, recordDate: record.date };
    }).filter((project): project is Project & { recordDate: number } => project !== undefined)
    .sort((a, b) => b.recordDate - a.recordDate);

  return (
    <>
      <DateConverter />
      <Button onClick={loadProjects} loading={fetchingProjects}>Load projects</Button>
      <div style={{ padding: '20px', display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Past Projects</h3>
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
        </div>
        <hr />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Past Due Projects</h3>
          <div>
            {pastDueProjects.map((project) => (
              <PeriodicCard key={project._id} project={project} showCardHeaderTags showDaysUntilNextDate />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Today Projects</h3>
          <div>
            {todayProjects.map((project) => (
              <PeriodicCard key={project._id} project={project} showCardHeaderTags />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Today Done Projects</h3>
          <div>
            {doneTodayProjects.map((project) => (
              <PeriodicCard key={project._id} project={project} showCardHeaderTags />
            ))}
          </div>
        </div>
        <hr />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Future Projects</h3>
          <div>
            {futureProjects.map((project) => (
              <PeriodicCard key={project._id} project={project} showCardHeaderTags showDaysUntilNextDate />
            ))}
          </div>
        </div>
        <hr />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Uncategorized Projects</h3>
          <div>
            {unCategorizedProjects.map((project) => (
              <PeriodicCard key={project._id} project={project} showCardHeaderTags showProgressControls={false} />
            ))}
          </div>
        </div>
      </div>
      <Col gap={10} style={{ padding: '20px' }}>
        <h2>Non Periodic Projects</h2>
        <div>
          {phantomProjects.map((project) => (
            <ProjectCard key={project._id} project={project} showCardHeaderTags debug />
          ))}
        </div>
      </Col>
    </>
  );
};

export default PeriodicProjectsPage;