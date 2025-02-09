import React, { useState } from 'react';
import Modal from '@/app/ui/Modal';
import { useSelector } from '@xstate/react';
import { ProjectActor, ProjectUIActor } from '@/app/resources';
import { Button, Col, Row, TextArea } from '@/app/ui';
import { getTitleText, isProjectPeriodic } from '@/utils';
import { textToProjects } from '@/utils/repository';
import NewProjectCard from '../cards/NewProjectCard';

type ProjectCreateModalProps = object

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = () => {
  const projectCreateModal = useSelector(ProjectUIActor, (state) => state.matches('createModal'));
  const defaultTag = useSelector(ProjectUIActor, ({ context }) => context.createOptions?.defaultTag);
  const createPeriodic = useSelector(ProjectUIActor, ({ context }) => context.createOptions?.createPeriodic);

  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const fetchingProjects = useSelector(ProjectActor, (state) => state.matches('fetching'));
  const updatingProjects = useSelector(ProjectActor, (state) => state.matches('updating'));
  const loading = fetchingProjects || updatingProjects;

  const [text, setText] = useState('');
  const [potentialProjects, setPotentialProjects] = useState<Project[]>([]);
  const [defaultIncubated, setDefaultIncubated] = useState(true);

  const closeModal = () => {
    ProjectUIActor.send({ type: 'CLOSE_MODAL' });
    setPotentialProjects([]);
    setDefaultIncubated(true);
  }

  const processProjects = () => {
    const appendedText = `${text}\n<<END>>`;
    const potentialResources = textToProjects(appendedText, projects)
      .map((project) => defaultTag ? ({ ...project, tags: [...new Set([...project.tags, defaultTag])] }) : project)
      .map((project) => {
        if (!defaultIncubated) return project;
        const title = getTitleText(project.title);
        if (!title) return project;
        return { ...project, title: `- [?] ${title}` };
      }).map((project) => {
        if (!createPeriodic) return project;
        const title = isProjectPeriodic(project) ? project.title : `${project.title} #periodic`;
        if (!title) return project;
        return { ...project, title };
      })
    setPotentialProjects(potentialResources);
  };

  const createProjects = () => {
    if (potentialProjects.length === 0) return;
    ProjectActor.send({ type: 'CREATE', newResources: potentialProjects, afterCreate: closeModal });
  };

  return (
    <Modal
      title={(
        <h3>
          {`Create ${createPeriodic ? 'Periodics' : 'Projects'}`}
        </h3>
      )}
      width={potentialProjects.length > 0 ? '1000px' : '500px'}
      visible={projectCreateModal}
      onClose={closeModal}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button onClick={processProjects} loading={loading}>Process</Button>
          <Button onClick={createProjects} loading={loading} disabled={potentialProjects.length < 1}>Create</Button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      }
    >
      <Row gap={10}>
        <Col gap={10} style={{ flex: '1' }}>
          <TextArea
            focus
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: '100%', height: '200px' }}
          />
          <Row centerY gap={10}>
            <label>Default incubated:</label>
            <input
              type="checkbox"
              checked={defaultIncubated}
              onChange={(e) => setDefaultIncubated(e.target.checked)}

              style={{ flex: 'none', width: 'auto' }}
            />
          </Row>
          <Row centerY gap={10}>
            <label>
              Default tag:
            </label>
            <pre>
              {defaultTag ? `${defaultTag}` : '[none]'}
            </pre>
          </Row>
        </Col>
        {potentialProjects.length > 0 && (
          <>
            <hr />
            <Col style={{ flex: '1' }}>
              {potentialProjects.map((project, i) => (
                <NewProjectCard key={i} project={project} showCardHeaderTags />
              ))}
            </Col>
          </>
        )}
      </Row>
    </Modal>
  );
};

export default ProjectCreateModal;