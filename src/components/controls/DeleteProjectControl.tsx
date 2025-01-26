import { AiOutlineDelete } from "react-icons/ai";
import { ProjectActor } from "@/app/resources";
import BaseControl from "./BaseControl";

type DeleteProjectControlProps = BaseControlProps;

const DeleteProjectControl: React.FC<DeleteProjectControlProps> = ({ project, show }) => {
  const deleteProject = () => {
    const confirmation = window.confirm('Are you sure you want to delete this project?');
    if (confirmation) {
      console.log('Deleting project: ', project);
      ProjectActor.send({ type: 'DELETE', resourceIds: [project._id] });
    }
  }

  return (
    <BaseControl onClick={deleteProject} icon={<AiOutlineDelete />} show={show}>Delete</BaseControl>
  );
}

export default DeleteProjectControl;