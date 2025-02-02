import React, { useState } from "react";
import { Col, Popover, Row } from "@/app/ui";
import { getTitleText } from "@/utils";

import styles from "./BaseProjectCard.module.scss";

type BaseProjectCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'content' | 'title'> & {
  project: Project;
  className?: string;
  children?: React.ReactNode;
  title?: React.ReactNode;
  content?: React.ReactNode[] | React.ReactNode;
  innerHeaderControls?: React.ReactNode[] | React.ReactNode;
  headerControls?: React.ReactNode[] | React.ReactNode;
  popOverContent?: React.ReactNode[] | React.ReactNode;
  popOverControls?: React.ReactNode[] | React.ReactNode;
  headerType?: 'normal' | 'periodic'
}

export const BaseProjectCard: React.FC<BaseProjectCardProps> = ({ className: _className, children, title, project, content, innerHeaderControls, headerControls, popOverContent, popOverControls, headerType = 'normal', ...props }) => {
  const [showDetails, setShowDetails] = useState(false);

  const titleText = getTitleText(project.title);
  const className = _className ?? '';
  const showPopOver = !!popOverContent || !!popOverControls;

  const NormalCardHeader = () => (
    <Row gap={10} centerY>
      <Row gap={10} centerY style={{ flex: '1' }}>
        <Popover
          content={showPopOver ? (
            <Col gap={10}>
              {popOverContent}
              {popOverControls && <hr />}
              {popOverControls}
            </Col>
          ) : null}
        >
          <span style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowDetails((prev) => !prev)}>
            {title ? title : <h4>{titleText}</h4>}
          </span>
        </Popover>
        {innerHeaderControls}
      </Row>
      {headerControls}
    </Row>
  );

  const PeriodicCardHeader = () => (
    <Row gap={10} centerY>
      <Col centerY style={{ flex: '1' }}>
        <div style={{ flex: 'none' }}>
          <Popover
            content={showPopOver ? (
              <Col gap={10}>
                {popOverContent}
                {popOverControls && <hr />}
                {popOverControls}
              </Col>
            ) : null}
          >
            <span style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowDetails((prev) => !prev)}>
              {title ? title : <h4>{titleText}</h4>}
            </span>
          </Popover>
        </div>
        {innerHeaderControls}
      </Col>
      {headerControls}
    </Row>
  );

  const CardHeader = () => headerType === 'normal' ? <NormalCardHeader /> : <PeriodicCardHeader />;

  return (
    <Col {...props} className={`${styles['project-card']} ${className}`} gap={10}>
      {children ? children : <CardHeader />}
      {showDetails && content}
    </Col>
  );
}

export default BaseProjectCard;