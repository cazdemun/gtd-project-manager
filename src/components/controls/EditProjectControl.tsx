import { AiOutlineEdit } from "react-icons/ai";
import { ProjectUIActor } from "@/app/resources";
import BaseControl from "./BaseControl";

type EditProjectControlProps = BaseControlProps;

const EditProjectControl: React.FC<EditProjectControlProps> = ({ project, show }) => {
  const openModal = () => {
    ProjectUIActor.send({ type: 'OPEN_UPDATE_MODAL', resource: project });
  }

  return (
    <BaseControl onClick={openModal} icon={<AiOutlineEdit />} show={show}>Edit</BaseControl>
  );
};

export default EditProjectControl;