import React from 'react';
import { ProjectActor, RecordActor } from "@/app/resources";
import BaseControl from "./BaseControl";
import { AiOutlineCheck } from 'react-icons/ai';
import { useSelector } from '@xstate/react';
import { wasPeriodicDoneToday } from '@/utils';

type DonePeriodicControlProps = BaseProjectControlProps;

const DonePeriodicControl: React.FC<DonePeriodicControlProps> = ({ project, show }) => {
  const records = useSelector(RecordActor, ({ context }) => context.resources);
  const fetchingRecords = useSelector(RecordActor, (state) => state.matches('fetching'));
  const loading = fetchingRecords;
  const wasDoneToday = wasPeriodicDoneToday(project, records);

  const doneProject = () => {
    if (wasDoneToday) return;
    RecordActor.send({ type: 'CREATE', newResources: [{ projectId: project._id, date: Date.now() }] });
    const periodicData = project.periodicData;
    const updatedPeriodicData = { ...periodicData, pinned: false };
    const updatedProject = { _id: project._id, periodicData: updatedPeriodicData };
    ProjectActor.send({ type: 'UPDATE', updatedResources: [updatedProject] });
  }

  return (
    <BaseControl disabled={wasDoneToday} onClick={doneProject} icon={<AiOutlineCheck />} show={show} loading={loading}>Done</BaseControl>
  );
};

export default DonePeriodicControl;