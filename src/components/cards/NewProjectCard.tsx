import React from "react";
import CardHeaderTags from "../CardHeaderTags";
import BaseProjectCard from "./BaseProjectCard";
import { CopyPasteControl } from "../controls";

type NewProjectCardContentProps = {
  project: Project;
}

const NewProjectCardContent: React.FC<NewProjectCardContentProps> = ({ project }) => {
  return (
    <>
      <div style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
        <pre>{JSON.stringify(project, null, 2)}</pre>
      </div>
    </>
  );
}

type NewProjectCardProps = {
  project: Project;
  showCardHeaderTags?: boolean;
}

const NewProjectCard: React.FC<NewProjectCardProps> = ({ project, showCardHeaderTags }) => {
  return (
    <BaseProjectCard
      title={<h4>{project.title}</h4>}
      project={project}
      innerHeaderControls={(<CopyPasteControl project={project} show='onlyIcon' />)}
      headerControls={showCardHeaderTags && <CardHeaderTags project={project} />}
      content={<NewProjectCardContent project={project} />}
      popOverContent={<NewProjectCardContent project={project} />}
    />
  )
};

export default NewProjectCard;