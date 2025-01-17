import { format } from "date-fns";

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