import { AiFillPushpin, AiOutlinePushpin } from "react-icons/ai";
import { ProjectActor } from "@/app/resources";
import BaseControl from "./BaseControl";
import { isTextProjectPeriodic } from "@/utils";
import { useSelector } from "@xstate/react";

type DeleteProjectControlProps = BaseProjectControlProps;

const PeriodicPinControl: React.FC<DeleteProjectControlProps> = ({ project, show }) => {
  const PinIcon = project.periodicData?.pinned ? AiFillPushpin : AiOutlinePushpin;

  const fetchingProjects = useSelector(ProjectActor, (state) => state.matches('fetching'));
  const disabled = !isTextProjectPeriodic(project) || fetchingProjects;

  const pinPeriodic = () => {
    if (disabled) return;
    const periodicData = project.periodicData;
    const updatedPeriodicData = { ...periodicData, pinned: !periodicData?.pinned };
    const updatedProject = { _id: project._id, periodicData: updatedPeriodicData };
    ProjectActor.send({ type: 'UPDATE', updatedResources: [updatedProject] });
  }

  return (
    <BaseControl onClick={pinPeriodic} icon={<PinIcon />} show={show} disabled={disabled}>Pin</BaseControl>
  );
}

export default PeriodicPinControl;