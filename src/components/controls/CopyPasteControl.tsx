import { AiOutlineCopy } from "react-icons/ai";
import { textProjectToText } from "@/utils/repository";
import BaseControl from "./BaseControl";

type CopyPasteControlProps = BaseProjectControlProps;

const CopyPasteControl: React.FC<CopyPasteControlProps> = ({ project, show }) => {
  const copyToClipboard = () => {
    // const title = extracTitleText(project.title);
    const text = textProjectToText(project);
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Project copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy project: ', err);
      });
  };

  return (
    <BaseControl onClick={copyToClipboard} icon={<AiOutlineCopy />} show={show}>Copy</BaseControl>
  );
}

export default CopyPasteControl;