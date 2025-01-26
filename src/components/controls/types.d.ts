type BaseControlShow = 'onlyIcon' | 'onlyText' | 'all';

type BaseControlProps<T extends object = object> = {
  project: Project;
  show?: BaseControlShow;
} & T;
