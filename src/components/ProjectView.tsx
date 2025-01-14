import { ProjectActor, ProjectUIActor } from "@/app/resources";
import React, { useEffect, useState } from "react";
import { AiOutlineCopy, AiOutlineCaretUp, AiOutlineCaretDown, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { Popover } from "@/app/ui";
import { getTagsAndCount } from "@/utils";
import { useSelector } from "@xstate/react";

import "./ProjectView.scss";

const isEqual = (tagsA: string[], tagsB: string[]): boolean => {
  if (tagsA.length !== tagsB.length) return false;
  return tagsA.every((tag) => tagsB.includes(tag));
}

const extracTitleText = (title: string): string => {
  return title.replaceAll(/^- \[x\]|^- \[X\]|^- \[ \]|^- \[\?\]|^- /g, '').trim();
}

type UpdateProjectFormProps = {
  project: Project;
}

const VALID_TAG_REGEX = /^(?:[a-zA-Z]+[-])*[a-zA-Z]+$/;

const UpdateTagsForm: React.FC<UpdateProjectFormProps> = ({ project }) => {
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);

  const [allTags,] = getTagsAndCount(projects);
  const leftTags = allTags.filter((tag) => !project.tags.includes(tag));

  const [upperRowTags, setUpperRowTags] = useState<string[]>(project.tags);
  const [lowerRowTags, setLowerRowTags] = useState<string[]>(leftTags);

  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');

  const handleUpdateTags = () => {
    const updatedProject = {
      _id: project._id,
      tags: upperRowTags,
    };

    ProjectActor.send({ type: 'UPDATE', updatedResources: updatedProject });
  }

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newTag.match(VALID_TAG_REGEX)) {
      setError('Invalid tag');
      return;
    }

    if (project.tags.includes(`#${newTag}`)) return;

    const updatedTags = [...project.tags, `#${newTag}`];
    const updatedProject = {
      _id: project._id,
      tags: updatedTags,
    };

    ProjectActor.send({ type: 'UPDATE', updatedResources: updatedProject });
  }

  useEffect(() => {
    setNewTag('');
    setError('');
    setUpperRowTags(project.tags);
    const [allTags,] = getTagsAndCount(projects);
    const leftTags = allTags.filter((tag) => !project.tags.includes(tag));
    setLowerRowTags(leftTags);
  }, [project, projects]);

  return (
    <>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {upperRowTags.map((tag, i) => (
              <button
                key={i}
                onClick={() => {
                  setUpperRowTags(upperRowTags.filter((t) => t !== tag));
                  setLowerRowTags([...lowerRowTags, tag]);
                }}
              >
                {`${tag} (x)`}
              </button>
            ))}
          </div>
          <hr />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {lowerRowTags.map((tag, i) => (
              <button
                key={i}
                onClick={() => {
                  setLowerRowTags(lowerRowTags.filter((t) => t !== tag));
                  setUpperRowTags([...upperRowTags, tag]);
                }}
              >
                {`${tag} (+)`}
              </button>
            ))}
          </div>
        </div>
        <hr />
        <button disabled={isEqual(project.tags, upperRowTags)} onClick={handleUpdateTags}>Update</button>
      </div>
      <hr />
      <form style={{ display: 'flex', gap: '10px' }} onSubmit={handleSubmitForm}>
        <input
          style={{ borderColor: error ? 'red' : 'gray', flex: '1' }}
          value={newTag}
          onChange={(e) => {
            setNewTag(e.target.value);
            if (e.target.value.match(VALID_TAG_REGEX)) {
              setError('');
            } else {
              setError('Invalid tag');
            }
          }}
        />
        <button type='submit'>Add new tag</button>
      </form>
    </>
  );
};

type OrderInfo = {
  _id: string;
  order: number | undefined;
  index: number;
}

type ProjectViewProps = {
  project: Project;
  showHeaderTags?: boolean;
  orderInfo?: OrderInfo[];
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, showHeaderTags, orderInfo }) => {
  const [showDetails, setShowDetails] = useState(false);
  const title = extracTitleText(project.title);

  useEffect(() => {
    setShowDetails(false);
  }, [project]);

  const _getTargetIndex = (currentOrderInfo: OrderInfo, orderInfos: OrderInfo[], direction: 'up' | 'down' | 'top' | 'bottom'): number | undefined => {
    if (direction === 'top') return 0;
    if (direction === 'bottom') return orderInfos.reduce((acc, item) => Math.max(acc, item.index), 0);
    return direction === 'up' ? currentOrderInfo.index - 1 : currentOrderInfo.index + 1;
  }

  const _swapPosition = (project: Project, orderInfos: OrderInfo[], direction: 'up' | 'down' | 'top' | 'bottom') => {
    const currentOrderInfo = orderInfos.find((item) => item._id === project._id);
    if (currentOrderInfo === undefined || currentOrderInfo.order === undefined) return;

    const targetIndex = _getTargetIndex(currentOrderInfo, orderInfos, direction);
    const targetOrderInfo = orderInfos.find((item) => item.index === targetIndex);
    if (targetOrderInfo === undefined || targetOrderInfo.order === undefined) return;

    if (targetOrderInfo.order === currentOrderInfo.order) return; // for bottom and top cases

    ProjectActor.send({
      type: 'UPDATE',
      updatedResources: [
        { _id: project._id, order: targetOrderInfo.order },
        { _id: targetOrderInfo._id, order: currentOrderInfo.order },
      ],
    });
  };

  const _updateProgress = (progress: " " | "x" | "?") => {
    const title = extracTitleText(project.title);
    const newTitle = `- [${progress}] ${title}`;
    ProjectActor.send({ type: 'UPDATE', updatedResources: [{ _id: project._id, title: newTitle }] });
  }

  const doneProject = () => {
    _updateProgress('x');
  }

  const pendingProject = () => {
    _updateProgress(' ');
  }

  const incubatedProject = () => {
    _updateProgress('?');
  }

  const toggleDetails = (e: React.MouseEvent<HTMLHeadingElement>) => {
    e.preventDefault();
    setShowDetails((prev) => !prev);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(title)
      .then(() => {
        console.log('Title copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy title: ', err);
      });
  };

  const swapPositionUp = () => {
    if (!orderInfo) return;
    _swapPosition(project, orderInfo, 'up');
  }

  const swapPositionDown = () => {
    if (!orderInfo) return;
    _swapPosition(project, orderInfo, 'down');
  }

  const swapPositionTop = () => {
    if (!orderInfo) return;
    _swapPosition(project, orderInfo, 'top');
  }

  const swapPositionBottom = () => {
    if (!orderInfo) return;
    _swapPosition(project, orderInfo, 'bottom');
  }

  const openModal = () => {
    ProjectUIActor.send({ type: 'OPEN_UPDATE_MODAL', resource: project });
  }

  const deleteProject = () => {
    const confirmation = window.confirm('Are you sure you want to delete this project?');
    if (confirmation) {
      console.log('Deleting project: ', project);
      ProjectActor.send({ type: 'DELETE', resourceIds: [project._id] });
    }
  }

  const Content = () => (
    <>
      <div>
        {project.actions.map((action, i) => (
          <div key={i}>
            <label style={{ fontSize: '14px' }}>
              {`\t${action}`}
            </label>
          </div>
        ))}
      </div>
      {project.description && (<p>{project.description}</p>)}
    </>
  )

  const Controls = () => (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button onClick={doneProject}>Done</button>
      <button onClick={pendingProject}>In Progress</button>
      <button onClick={incubatedProject}>Incubate</button>
      {orderInfo && (
        <>
          <hr />
          <button onClick={swapPositionTop}>Top</button>
          <button onClick={swapPositionBottom}>Bottom</button>
        </>
      )}
      <hr />
      <button className="icon-button" onClick={deleteProject}><AiOutlineDelete /></button>
    </div>
  )

  const HeaderTags = () => (
    <Popover
      content={(
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <UpdateTagsForm project={project} />
        </div>
      )}
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
        {project.tags.length === 0
          ? (<pre>(no tags)</pre>)
          : project.tags.map((tag, i) => (<pre key={i}>{tag}</pre>))
        }
      </div>
    </Popover>
  );

  return (
    <div className="project-view-container" style={{ padding: '10px', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1' }}>
          <Popover
            content={(
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <Content />
                <hr />
                <Controls />
              </div>
            )}
          >
            <h4
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={toggleDetails}
            >
              {title}
            </h4>
          </Popover>
          <button className="icon-button" onClick={copyToClipboard}><AiOutlineCopy /></button>
          <button className="icon-button" onClick={openModal}><AiOutlineEdit /></button>
          {!showDetails && showHeaderTags && (<HeaderTags />)}
        </div>
        {orderInfo && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="icon-button" onClick={swapPositionUp}><AiOutlineCaretUp /></button>
            <button className="icon-button" onClick={swapPositionDown}><AiOutlineCaretDown /></button>
          </div>
        )}
      </div>
      {showDetails && (
        <>
          <Content />
          <div>
            <HeaderTags />
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectView;