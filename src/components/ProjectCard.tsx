import React from "react";
import { Row } from "@/app/ui";
import CardHeaderTags from "./CardHeaderTags";
import BaseProjectCard from "./BaseProjectCard";
import { EditProjectControl, CopyPasteControl, DeleteProjectControl, ProgressProjectControls, SwapTopControl, SwapBottomControl, SwapUpControl, SwapDownControl } from "./controls";

type ProjectCardContentProps = {
  project: Project;
  showCardHeaderTags?: boolean;
  actionsStartIndentLevelZero?: boolean;
}

const ProjectCardContent: React.FC<ProjectCardContentProps> = ({ project, actionsStartIndentLevelZero, showCardHeaderTags = true }) => {
  return (
    <>
      {project.actions.length > 0 && (
        <div>
          {project.actions.map((action, i) => (
            <p key={i} style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
              {`${actionsStartIndentLevelZero ? '' : '\t'}${action}`}
            </p>
          ))}
        </div>
      )}
      {project.description && (
        <div>
          {project.description.split('\n').map((line, index) => (
            <p key={index} style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
              {line}
            </p>
          ))}
        </div>
      )}
      {showCardHeaderTags && (
        <div>
          <CardHeaderTags project={project} showPopover={false} />
        </div>
      )}
    </>
  );
}

type ProjectCardProps = {
  project: Project;
  showCardHeaderTags?: boolean;
  orderInfos?: OrderInfo[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, showCardHeaderTags, orderInfos }) => {
  return (
    <BaseProjectCard
      controls={
        <>
          <EditProjectControl project={project} show='onlyIcon' />
          <CopyPasteControl project={project} show='onlyIcon' />
          {showCardHeaderTags && <CardHeaderTags project={project} />}
          {orderInfos && (
            <>
              <hr style={{ alignSelf: 'stretch' }} />
              <SwapUpControl project={project} orderInfos={orderInfos} show="onlyIcon" />
              <SwapDownControl project={project} orderInfos={orderInfos} show="onlyIcon" />
            </>)
          }
        </>
      }
      project={project}
      content={<ProjectCardContent project={project} />}
      popOverContent={<ProjectCardContent project={project} showCardHeaderTags={false} actionsStartIndentLevelZero />}
      popOverControls={
        <Row centerY gap={10} style={{ flexWrap: 'wrap' }}>
          <ProgressProjectControls project={project} />
          {orderInfos && (
            <>
              <hr style={{ alignSelf: 'stretch' }} />
              <SwapTopControl project={project} orderInfos={orderInfos} show="onlyIcon" />
              <SwapBottomControl project={project} orderInfos={orderInfos} show="onlyIcon" />
            </>
          )}
          <hr style={{ alignSelf: 'stretch' }} />
          <DeleteProjectControl project={project} show="onlyIcon" />
        </Row>
      }
    />
  )
};

export default ProjectCard;