type BaseControlShow = 'onlyIcon' | 'onlyText' | 'all';

type BaseProjectControlProps<T extends object = object> = {
  project: Project;
  show?: BaseControlShow;
  disabled?: boolean;
} & T;
