import React, { useEffect, useState } from 'react';
import Modal from '@/app/ui/Modal';
import { useSelector } from '@xstate/react';
import { ProjectActor, ProjectUIActor } from '@/app/resources';
import { convertProjectToRawProject, convertRawProjectToProject } from '@/utils';
import { Button } from '@/app/ui';

type ProjectUpdateModalProps = object

const ProjectUpdateModal: React.FC<ProjectUpdateModalProps> = () => {
  const projectUpdateModal = useSelector(ProjectUIActor, (state) => state.matches('updateModal'));
  const selectedProject = useSelector(ProjectUIActor, ({ context }) => context.selectedResource);
  const fetchingProjects = useSelector(ProjectActor, (state) => state.matches('fetching'));
  const updatingProjects = useSelector(ProjectActor, (state) => state.matches('updating'));
  const loading = fetchingProjects || updatingProjects;

  const [text, setText] = useState('');

  useEffect(() => {
    if (!selectedProject) return;
    setText(convertProjectToRawProject(selectedProject));
  }, [selectedProject]);


  const closeModal = () => {
    ProjectUIActor.send({ type: 'CLOSE_MODAL' });
  }

  const updateProject = () => {
    const updatedProject = convertRawProjectToProject(text);
    if (!updatedProject) return;
    ProjectActor.send({ type: 'UPDATE', updatedResources: updatedProject, afterUpdate: closeModal });
  };

  return (
    <Modal
      visible={projectUpdateModal}
      onClose={closeModal}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button onClick={updateProject} loading={loading}>Update</Button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      }
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', height: '200px' }}
      />
    </Modal>
  );
};

export default ProjectUpdateModal;