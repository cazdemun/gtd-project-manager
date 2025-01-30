import { v4 as uuidv4 } from 'uuid';
import { isAfterByDay, isBeforeByDay, isDoneDate } from './dates';
import { addDays, differenceInDays, isToday, startOfDay } from 'date-fns';
import { RAW_PROJECT_REGEX } from './constants';

export function isNullish<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined;
}

export function withConfirmation(message: string, callback: () => void) {
  const confirmation = window.confirm(message);
  if (confirmation) {
    callback();
  }
}

/**
 * 
 * @param text 
 * @returns 
 */
export function getPotentialTextResources(text: string): string[] {
  return text.match(RAW_PROJECT_REGEX) ?? [];
}

/**
 * Adds an identifier to the end of a potential text project.
 * 
 * The regex for identifiying a project is based on the following rules:
 * - If there is no identifier, the text project ends in a new line before a new project starts.
 * - If there is a identifier, the text project ends at the end of the identifier.
 * 
 * Based on this, the normalized text will never have a new line at the end.
 * 
 * @param text 
 * @returns 
 */
export function normalizePotentialTextResource(text: string): string {
  const uuidRegex = /<!--ID: [a-f0-9-]{36}-->/;
  if (!uuidRegex.test(text)) {
    return `${text}<!--ID: ${uuidv4()}-->`;
  }
  return `${text}`;
}

// --- Project Utils ---

export function isProjectDone(project: Project): boolean {
  return project.title.includes('[x]') || project.title.includes('[X]');
}

export function isProjectIncubated(project: Project): boolean {
  return project.title.includes('[?]');
}

export function isProjectPending(project: Project): boolean {
  return !isProjectDone(project) && !isProjectIncubated(project);
}

export function getTitleText(title: string, filterPeriodic: boolean = false): string {
  if (filterPeriodic) return title.replaceAll(/^- \[x\]|^- \[X\]|^- \[ \]|^- \[\?\]|^- |#periodic/g, '').trim();
  return title.replaceAll(/^- \[x\]|^- \[X\]|^- \[ \]|^- \[\?\]|^- /g, '').trim();
}



export const getCountedTags = (projects: Project[], dateFilter: number | undefined): [Record<string, number>, Record<string, number>, Record<string, number>, Record<string, number>] => {
  const pendingTagsCount: Record<string, number> = {};
  const doneTagsCount: Record<string, number> = {};
  const incubatedTagsCount: Record<string, number> = {};
  const overallTags: Record<string, number> = {};

  projects.forEach((project) => {
    project.tags.forEach((tag) => {
      pendingTagsCount[tag] = (pendingTagsCount[tag] ?? 0);
      doneTagsCount[tag] = (doneTagsCount[tag] ?? 0);
      incubatedTagsCount[tag] = (incubatedTagsCount[tag] ?? 0);
      overallTags[tag] = (overallTags[tag] ?? 0) + 1;

      if (isProjectDone(project)) {
        if (isDoneDate(dateFilter, project.done)) {
          doneTagsCount[tag] = (doneTagsCount[tag] ?? 0) + 1;
        }
      } else if (isProjectIncubated(project)) {
        incubatedTagsCount[tag] = (incubatedTagsCount[tag] ?? 0) + 1;
      } else {
        pendingTagsCount[tag] = (pendingTagsCount[tag] ?? 0) + 1;
      }
    });

  });

  return [pendingTagsCount, doneTagsCount, incubatedTagsCount, overallTags];
};

export const getSortedTags = (tagCount: Record<string, number>): string[] => {
  const predefinedOrder = ['#today', '#week', '#month', "#trimester"];
  return Object.entries(tagCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .sort(([tagA], [tagB]) => {
      const indexA = predefinedOrder.indexOf(tagA);
      const indexB = predefinedOrder.indexOf(tagB);
      if (indexA === -1 && indexB === -1) return 0; // Both tags are not in predefinedOrder
      if (indexA === -1) return 1; // tagA is not in predefinedOrder, tagB comes first
      if (indexB === -1) return -1; // tagB is not in predefinedOrder, tagA comes first
      return indexA - indexB; // Both tags are in predefinedOrder, sort by predefinedOrder
    })
    .map(([tag]) => tag);
};

export const getTagsAndCount = (projects: Project[], dateFilter?: number | undefined): [string[], Record<string, number>, Record<string, number>, Record<string, number>, Record<string, number>] => {
  const [pendingTagsCount, doneTagsCount, incubatedTagsCount, overallTags] = getCountedTags(projects, dateFilter);
  const tags = getSortedTags(pendingTagsCount);
  return [tags, pendingTagsCount, doneTagsCount, incubatedTagsCount, overallTags];
};


// Periodic Projects Utils

export const getLastRecord = (project: Project, records: DoneRecord[]): DoneRecord | undefined => {
  return records
    .filter((record) => record.projectId === project._id)
    .sort((a, b) => b.date - a.date)
    .at(0);
}

export function isTextProjectPeriodic(textProject: TextProject): boolean {
  return textProject.title.match(/- .*?#periodic/) !== null;
}

export function getLastDoneDate(project: Project, records: DoneRecord[]): number | undefined {
  const lastRecord = getLastRecord(project, records);
  if (lastRecord === undefined) return undefined;
  return lastRecord.date;
}

export function wasPeriodicDoneToday(project: Project, records: DoneRecord[]): boolean {
  const lastRecord = getLastRecord(project, records);
  if (lastRecord === undefined) return false;
  return isToday(lastRecord.date);
}

export const getNextDate = (project: Project, records: DoneRecord[]): number | undefined => {
  if (!project.periodic) return undefined;
  if (!project.periodicData) return undefined;

  const scheduled = project.periodicData.scheduled;
  const period = project.periodicData.period;

  const noPeriod = period === undefined || period === null || period < 1;
  const lastRecord = getLastRecord(project, records);
  const noNextDateFromPeriod = noPeriod || !lastRecord;

  const wasDoneToday = wasPeriodicDoneToday(project, records);

  /**
   * Schedule takes priority when:
   * 1. The schedule date is after today
   * 2. The schedule date is today but the project was not done yet
   * 3. The schedule date was before today but there is not a last record or period (both must be present to calculate the next date)
   */
  if (scheduled && isAfterByDay(scheduled, new Date())) return scheduled;
  if (scheduled && isToday(scheduled) && !wasDoneToday) return scheduled;
  if (scheduled && isBeforeByDay(scheduled, new Date()) && noNextDateFromPeriod) return scheduled;

  // With no schedule nor a valid period, we return undefined
  // With no record we can't calculate the next date even if we have a period
  if (noNextDateFromPeriod) return undefined;

  return addDays(lastRecord.date, period).getTime();
}

export function daysFromToday(nextDate: number | undefined): number | undefined {
  if (nextDate === undefined) return undefined;
  const dateA = startOfDay(nextDate);
  const dateB = startOfDay(new Date());
  return differenceInDays(dateA, dateB);
}

export const isPeriodicUncategorized = (project: Project, records: DoneRecord[]): boolean => {
  const nextDate = getNextDate(project, records);
  return nextDate === undefined;
}

export const isPeriodicFuture = (project: Project, records: DoneRecord[]): boolean => {
  const nextDate = getNextDate(project, records);
  if (nextDate === undefined) return false;
  return isAfterByDay(nextDate, new Date());
}

export const isPeriodicToday = (project: Project, records: DoneRecord[]): boolean => {
  const isDoneToday = wasPeriodicDoneToday(project, records);
  if (isDoneToday) return false;
  const nextDate = getNextDate(project, records);
  if (nextDate === undefined) return false;
  return isToday(nextDate);
}

export const isPeriodicPastDue = (project: Project, records: DoneRecord[]): boolean => {
  const nextDate = getNextDate(project, records);
  if (nextDate === undefined) return false;
  return isBeforeByDay(nextDate, new Date());
}