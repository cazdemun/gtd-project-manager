type Project = {
  _id: string;
  rawProject: string;
  tags: string[];
  title: string;
  actions: string[];
  description: string;
  order?: number;
  // completed
  // scheduled
}

type TextProject = Pick<Project, '_id' | 'actions' | 'description' | 'rawProject' | 'title' | 'tags'>;
