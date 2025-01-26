type Project = {
  _id: string;
  rawProject: string;
  tags: string[];
  title: string;
  actions: string[];
  description: string;
  // Metadata
  done?: number;
  order: number;
  periodic: boolean;
  periodicData?: {
    scheduled?: number;
    period?: number;
  }
  // completed
  // scheduled
}

type TextProject = Pick<Project, '_id' | 'actions' | 'description' | 'rawProject' | 'title' | 'tags'>;

type Source = {
  _id: string;
  title: string;
  path: string;
  slug: string;
  description: string;
  order: number;
  selected?: boolean;
  // type: 'file' | 'url';
}

type DoneRecord = {
  _id: string;
  projectId: string;
  date: number;
}

/**
 * Utility type used for swapping the order of two projects that are grouped by tag.
 */
type OrderInfo = {
  _id: string;
  order: number | undefined;
  index: number;
}