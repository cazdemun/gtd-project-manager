type Project = {
  _id: string;
  rawProject: string;
  tags: string[];
  title: string;
  actions: string[];
  description: string;
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