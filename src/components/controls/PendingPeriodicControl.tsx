import React from 'react';
import { RecordActor } from "@/app/resources";
import BaseControl from "./BaseControl";
import { AiOutlineClose } from 'react-icons/ai';
import { useSelector } from '@xstate/react';
import { wasPeriodicDoneToday } from '@/utils';
import { isSameDay } from 'date-fns';

type PendingPeriodicControlProps = BaseProjectControlProps;

const PendingPeriodicControl: React.FC<PendingPeriodicControlProps> = ({ project, show }) => {
  const records = useSelector(RecordActor, ({ context }) => context.resources);
  const fetchingRecords = useSelector(RecordActor, (state) => state.matches('fetching'));
  const wasDoneToday = wasPeriodicDoneToday(project, records);

  const pendingProject = () => {
    const todayRecords = records
      .filter((record) => record.projectId === project._id)
      .filter((record) => isSameDay(record.date, Date.now()));
    console.log(todayRecords);
    RecordActor.send({ type: 'DELETE', resourceIds: todayRecords.map((record) => record._id) });
  }

  return (
    <BaseControl disabled={!wasDoneToday} onClick={pendingProject} icon={<AiOutlineClose />} show={show} loading={fetchingRecords}>Pending</BaseControl>
  );
};

export default PendingPeriodicControl;