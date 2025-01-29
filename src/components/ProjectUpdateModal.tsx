import React, { useEffect, useState } from 'react';
import Modal from '@/app/ui/Modal';
import { useSelector } from '@xstate/react';
import { ProjectActor, ProjectUIActor } from '@/app/resources';
import { textProjectToText, textToTextProject } from '@/utils/repository';
import { Button, Row, TextArea } from '@/app/ui';
import LinealDatePicker, { doneFilterDisableNextDay, doneFilterRule } from './LinealDatePicker';

type ProjectUpdateModalProps = object

const ProjectUpdateModal: React.FC<ProjectUpdateModalProps> = () => {
  const projectUpdateModal = useSelector(ProjectUIActor, (state) => state.matches('updateModal'));
  const selectedProject = useSelector(ProjectUIActor, ({ context }) => context.selectedResource);
  const fetchingProjects = useSelector(ProjectActor, (state) => state.matches('fetching'));
  const updatingProjects = useSelector(ProjectActor, (state) => state.matches('updating'));
  const loading = fetchingProjects || updatingProjects;

  const [text, setText] = useState('');
  const [doneDate, setDoneDate] = useState<number | undefined>(selectedProject?.done);

  useEffect(() => {
    if (!selectedProject) return;
    setText(textProjectToText(selectedProject));
    setDoneDate(selectedProject.done);
  }, [selectedProject]);


  const closeModal = () => {
    ProjectUIActor.send({ type: 'CLOSE_MODAL' });
  }

  const updateProject = () => {
    const updatedProject = textToTextProject(text) as Project;
    if (!updatedProject) return;
    if (doneDate) updatedProject.done = doneDate;
    ProjectActor.send({ type: 'UPDATE', updatedResources: updatedProject, afterUpdate: closeModal });
  };

  const deleteProject = () => {
    const confirmation = window.confirm('Are you sure you want to delete this project?');
    if (confirmation && selectedProject) {
      console.log('Deleting project: ', selectedProject);
      ProjectActor.send({ type: 'DELETE', resourceIds: [selectedProject._id,], afterDelete: closeModal });
    }
  }

  return (
    <Modal
      visible={projectUpdateModal}
      onClose={closeModal}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button onClick={updateProject} loading={loading}>Update</Button>
          <Button onClick={deleteProject} loading={loading}>Delete</Button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      }
    >
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', height: '200px' }}
      />
      {doneDate && (
        <>
          <hr />
          <Row gap={[10, 5]} centerY>
            <label>Done date:</label>
            <LinealDatePicker
              initialValue={doneDate}
              onValueChange={setDoneDate}
              rules={[doneFilterRule]}
              disableGoNextDay={doneFilterDisableNextDay}
            />
          </Row>
        </>
      )}

    </Modal>
  );
};

export default ProjectUpdateModal;