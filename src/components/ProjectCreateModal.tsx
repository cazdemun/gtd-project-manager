import React, { useState } from 'react';
import Modal from '@/app/ui/Modal';
import { useSelector } from '@xstate/react';
import { ProjectActor, ProjectUIActor } from '@/app/resources';
import { isTextProjectPeriodic, textToTextProject } from '@/utils/repository';
import { Button, Col, Row, TextArea } from '@/app/ui';
import { extracTitleText, getPotentialTextResources, normalizePotentialTextResource } from '@/utils';
import NewProjectCard from './NewProjectCard';

type ProjectCreateModalProps = object

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = () => {
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const projectCreateModal = useSelector(ProjectUIActor, (state) => state.matches('createModal'));
  const defaultTag = useSelector(ProjectUIActor, ({ context }) => context.createOptions?.defaultTag);
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
    const potentialResources = getPotentialTextResources(appendedText)
      .map((textResource) => normalizePotentialTextResource(textResource))
      .map((text) => textToTextProject(text))
      .filter((project): project is TextProject => project !== undefined)
      .map((project) => {
        if (!defaultTag) return project;
        return { ...project, tags: [...new Set([...project.tags, defaultTag])] };
      }).map((project) => {
        if (!defaultIncubated) return project;
        const title = extracTitleText(project.title);
        if (!title) return project;
        return { ...project, title: `- [?] ${title}` };
      }).map((project, index) => {
        const lastOrder = projects.reduce((acc, resource) => Math.max(acc, (resource as { order?: number })?.order ?? 0), 0)
        return { ...project, order: lastOrder + index + 1 };
      }).map((project) => {
        return { ...project, periodic: isTextProjectPeriodic(project) };
      });
    setPotentialProjects(potentialResources);
  };

  const createProjects = () => {
    if (potentialProjects.length === 0) return;
    ProjectActor.send({ type: 'CREATE', newResources: potentialProjects, afterCreate: closeModal });
  };

  return (
    <Modal
      width={potentialProjects.length > 0 ? '1000px' : '500px'}
      visible={projectCreateModal}
      onClose={closeModal}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button onClick={processProjects} loading={loading}>Process</Button>
          <Button onClick={createProjects} loading={loading}>Create</Button>
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