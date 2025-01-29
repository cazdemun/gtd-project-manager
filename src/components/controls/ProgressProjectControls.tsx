import React from 'react';
import { getTitleText } from "@/utils";
import { ProjectActor } from "@/app/resources";
import BaseControl from "./BaseControl";
import { AiOutlineCheck } from 'react-icons/ai';
import { useSelector } from '@xstate/react';

type ProgressProjectControlProps = BaseProjectControlProps;

const _updateProgress = (project: Project, progress: " " | "x" | "?") => {
  const title = getTitleText(project.title);
  const newTitle = `- [${progress}] ${title}`;
  ProjectActor.send({
    type: 'UPDATE', updatedResources: [{
      _id: project._id,
      title: newTitle,
      done: progress === 'x' ? Date.now() : undefined,
    }]
  });
};

const DoneProjectControl: React.FC<ProgressProjectControlProps> = ({ project, show }) => {
  const fetchingProject = useSelector(ProjectActor, (state) => state.matches('fetching'));

  const doneProject = () => {
    _updateProgress(project, 'x');
  };

  return (
    <BaseControl onClick={doneProject} icon={<AiOutlineCheck />} show={show} loading={fetchingProject}>Done</BaseControl>
  );
};

const PendingProjectControl: React.FC<ProgressProjectControlProps> = ({ project }) => {
  const fetchingProject = useSelector(ProjectActor, (state) => state.matches('fetching'));

  const pendingProject = () => {
    _updateProgress(project, ' ');
  };

  return (
    <BaseControl onClick={pendingProject} loading={fetchingProject}>In Progress</BaseControl>
  );
};

const IncubatedProjectControl: React.FC<ProgressProjectControlProps> = ({ project }) => {
  const fetchingProject = useSelector(ProjectActor, (state) => state.matches('fetching'));

  const incubatedProject = () => {
    _updateProgress(project, '?');
  };

  return (
    <BaseControl onClick={incubatedProject} loading={fetchingProject}>Incubate</BaseControl>
  );
};

const ProgressProjectControls: React.FC<ProgressProjectControlProps> = ({ project }) => {
  return (
    <>
      <DoneProjectControl project={project} show='onlyText' />
      <PendingProjectControl project={project} />
      <IncubatedProjectControl project={project} />
    </>
  );
};

export { DoneProjectControl, PendingProjectControl, IncubatedProjectControl, ProgressProjectControls };