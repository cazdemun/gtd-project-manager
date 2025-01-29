import React from 'react';
import BaseProjectCard from './BaseProjectCard';
import Row from '@/app/ui/Row';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/utils/dates';

type SelectProjectCardProps = {
  project: Project;
  selected: boolean;
  onSelect: (projectId: string) => void;
};

const SelectProjectCard: React.FC<SelectProjectCardProps> = ({ project, selected, onSelect }) => {
  return (
    <BaseProjectCard project={project}>
      <Row centerY gap={10}>
        <Row centerY gap={10} style={{ flex: '1' }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(project._id)}
            style={{ flex: 'none', width: 'auto' }}
          />
          <h4>{project.title}</h4>
          <pre>{project.tags.join(', ')}</pre>
        </Row>
        {project.done && <pre>{format(project.done, DATE_FORMAT)}</pre>}
      </Row>
    </BaseProjectCard>
  );
};

export default SelectProjectCard;