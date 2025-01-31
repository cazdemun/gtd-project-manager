import React from "react";
import { format } from "date-fns";
import { Col, Row, Text } from "@/app/ui";
import { daysFromToday, getTitleText, getLastDoneDate, getNextDate, wasPeriodicDoneToday } from "@/utils";
import { useSelector } from "@xstate/react";
import { RecordActor } from "@/app/resources";
import { DATE_FORMAT } from "@/utils/dates";
import BaseProjectCard from "./BaseProjectCard";
import CardHeaderTags from "../CardHeaderTags";
import { EditProjectControl, CopyPasteControl, DeleteProjectControl, SwapTopControl, SwapBottomControl, SwapUpControl, SwapDownControl, DonePeriodicControl, PendingPeriodicControl } from "../controls";
import UpdatePeriodicForm from "../forms/UpdatePeriodicForm";

import styles from "./PeriodicCard.module.scss";

type PeriodicCardContentProps = {
  project: Project;
  showCardHeaderTags?: boolean;
  actionsStartIndentLevelZero?: boolean;
}

const PeriodicCardContent: React.FC<PeriodicCardContentProps> = ({ project, actionsStartIndentLevelZero, showCardHeaderTags = true }) => {
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
          <Text>{project.description}</Text>
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

type PeriodicCardControlsProps = {
  project: Project;
  showProgressControls?: boolean;
  orderInfos?: OrderInfo[];
}

const PeriodicCardHeaderControls: React.FC<PeriodicCardControlsProps> = ({ project, orderInfos, showProgressControls }) => {
  const records = useSelector(RecordActor, ({ context }) => context.resources);
  const wasDoneToday = wasPeriodicDoneToday(project, records);
  const showDonePeriodicControl = showProgressControls && wasDoneToday !== undefined && !wasDoneToday;
  const showPendingPeriodicControl = showProgressControls && wasDoneToday !== undefined && wasDoneToday;
  return (
    <Row gap={5} centerY>
      <Col>
        {showDonePeriodicControl && (<DonePeriodicControl project={project} show='onlyIcon' />)}
        {showPendingPeriodicControl && (<PendingPeriodicControl project={project} show='onlyIcon' />)}
        <EditProjectControl project={project} show='onlyIcon' />
      </Col>
      {/* {showCardHeaderTags && <CardHeaderTags project={project} />} */}
      {orderInfos && (
        <>
          <hr style={{ alignSelf: 'stretch' }} />
          <SwapUpControl project={project} orderInfos={orderInfos} show="onlyIcon" />
          <SwapDownControl project={project} orderInfos={orderInfos} show="onlyIcon" />
        </>
      )}
    </Row>
  );
}

type PeriodicCardProps = {
  project: Project;
  showCardHeaderTags?: boolean;
  showProgressControls?: boolean;
  orderInfos?: OrderInfo[];
  showDaysUntilNextDate?: boolean;
  recordDate?: number;
}

const PeriodicCard: React.FC<PeriodicCardProps> = ({ project, showCardHeaderTags, orderInfos, recordDate, showProgressControls = true, showDaysUntilNextDate = false }) => {
  const records = useSelector(RecordActor, ({ context }) => context.resources);
  const title = getTitleText(project.title, true);
  const lastDate = getLastDoneDate(project, records);
  const nextDate = getNextDate(project, records)
  const daysFromTodayUntilNextDate = showDaysUntilNextDate ? `(${daysFromToday(nextDate)})` : '';
  return (
    <BaseProjectCard
      headerType="periodic"
      className={project.periodicData?.period === 1 ? styles["daily"] : ''}
      title={<h5>{`${title} ${daysFromTodayUntilNextDate}`}</h5>}
      headerControls={<PeriodicCardHeaderControls project={project} orderInfos={orderInfos} showProgressControls={showProgressControls} />}
      innerHeaderControls={showCardHeaderTags && <div><CardHeaderTags project={project} /></div>}
      project={project}
      content={<PeriodicCardContent project={project} />}
      popOverContent={(
        <>
          <PeriodicCardContent project={project} showCardHeaderTags={false} actionsStartIndentLevelZero />
          <hr />
          <pre>{JSON.stringify(project._id)}</pre>
          <pre>Period: {project.periodicData?.period ? project.periodicData.period : 'No period'}</pre>
          <pre>Last done date: {lastDate ? format(lastDate, DATE_FORMAT) : 'No last date'}</pre>
          <pre>Next done date: {nextDate ? format(nextDate, DATE_FORMAT) : 'No next date'}</pre>
          {recordDate && (<pre>Record date: {format(recordDate, DATE_FORMAT)}</pre>)}
          <hr />
          <UpdatePeriodicForm project={project} />
        </>
      )}
      popOverControls={
        < Row centerY gap={10} style={{ flexWrap: 'wrap' }}>
          <DonePeriodicControl project={project} show='onlyText' />
          <PendingPeriodicControl project={project} show='onlyText' />
          {
            orderInfos && (
              <>
                <hr style={{ alignSelf: 'stretch' }} />
                <SwapTopControl project={project} orderInfos={orderInfos} show="onlyIcon" />
                <SwapBottomControl project={project} orderInfos={orderInfos} show="onlyIcon" />
              </>
            )
          }
          <hr style={{ alignSelf: 'stretch' }} />
          <CopyPasteControl project={project} show='onlyIcon' />
          <DeleteProjectControl project={project} show="onlyIcon" />
        </Row >
      }
    />
  )
};

export default PeriodicCard;