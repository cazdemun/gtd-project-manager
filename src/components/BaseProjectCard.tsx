import React, { useState } from "react";
import { Col, Popover, Row } from "@/app/ui";
import { extracTitleText } from "@/utils";

import styles from "./BaseProjectCard.module.scss";

type BaseProjectCardProps = {
  children?: React.ReactNode;
  title?: React.ReactNode;
  project: Project;
  content?: React.ReactNode[] | React.ReactNode;
  controls?: React.ReactNode[] | React.ReactNode;
  popOverContent?: React.ReactNode[] | React.ReactNode;
  popOverControls?: React.ReactNode[] | React.ReactNode;
}

export const BaseProjectCard: React.FC<BaseProjectCardProps> = ({ children, title, project, content, controls, popOverContent, popOverControls }) => {
  const [showDetails, setShowDetails] = useState(false);

  const titleText = extracTitleText(project.title);

  const showPopOver = !!popOverContent || !!popOverControls;

  const CardHeader = () => (
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
      </Row>
      {controls}
    </Row>
  );

  return (
    <Col className={styles['project-card']} gap={10}>
      {children ? children : <CardHeader />}
      {showDetails && content}
    </Col>
  );
}

export default BaseProjectCard;