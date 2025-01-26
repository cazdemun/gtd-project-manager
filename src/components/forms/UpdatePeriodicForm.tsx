import { ProjectActor } from "@/app/resources";
import React, { useEffect, useState } from "react";
import LinealDatePicker from "../LinealDatePicker";
import LinealInputNumber from "../LinealInputNumber";

type UpdatePeriodicDataFormProps = {
  project: Project;
}

const UpdatePeriodicForm: React.FC<UpdatePeriodicDataFormProps> = ({ project }) => {
  const [period, setPeriod] = useState<number | undefined>(project.periodicData?.period ?? undefined);
  const [scheduled, setScheduled] = useState<number | undefined>(project.periodicData?.scheduled ?? undefined);

  useEffect(() => {
    setPeriod(project.periodicData?.period ?? undefined);
    setScheduled(project.periodicData?.scheduled ?? undefined);
  }, [project]);

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const doesPeriodicDataExists = scheduled !== undefined || period !== undefined;

    const newPeriodicData = doesPeriodicDataExists ?
      {
        scheduled,
        period,
      } : undefined;

    const updatedProject = {
      _id: project._id,
      periodicData: newPeriodicData,
    };
    ProjectActor.send({ type: 'UPDATE', updatedResources: updatedProject });
  }

  return (
    <>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmitForm}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>Period</label>
          <LinealInputNumber initialValue={period} onValueChange={setPeriod} />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>Scheduled</label>
          <LinealDatePicker initialValue={scheduled} onValueChange={setScheduled} mode="input" />
        </div >
        <button type='submit'>Update Periodic Data</button>
      </form >
    </>
  );
};

export default UpdatePeriodicForm;