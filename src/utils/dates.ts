import { format, isAfter, isBefore, startOfDay } from "date-fns";

export const DATE_FORMAT = 'MM/dd/yyyy';

export const isDoneDate = (dateFilter: number | undefined, doneDate: number | undefined): boolean => {
  if (dateFilter === undefined) {
    return true;
  }
  if (doneDate === undefined) {
    return false;
  }
  return format(doneDate, DATE_FORMAT) === format(dateFilter, DATE_FORMAT);
}

export const isAfterByDay = (dateA: Date | number, dateB: Date | number) => {
  const normalizedDateA = startOfDay(dateA);
  const normalizedDateB = startOfDay(dateB);
  return isAfter(normalizedDateA, normalizedDateB);
}

export const isBeforeByDay = (dateA: Date | number, dateB: Date | number) => {
  const normalizedDateA = startOfDay(dateA);
  const normalizedDateB = startOfDay(dateB);
  return isBefore(normalizedDateA, normalizedDateB);
}