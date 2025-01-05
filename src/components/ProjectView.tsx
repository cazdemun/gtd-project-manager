import { ProjectActor, ProjectUIActor } from "@/app/resources";
import React, { useEffect, useState } from "react";
import { AiOutlineCopy, AiOutlineCaretUp, AiOutlineCaretDown, AiOutlineEdit } from "react-icons/ai";
import { Popover } from "@/app/ui";
import { getTagsAndCount } from "@/utils";
import { useSelector } from "@xstate/react";

const hasSameTags = (tagsA: string[], tagsB: string[]): boolean => {
  if (tagsA.length !== tagsB.length) return false;
  return tagsA.every((tag) => tagsB.includes(tag));
}

type UpdateProjectFormProps = {
  project: Project;
}

const VALID_TAG_REGEX = /^(?:[a-zA-Z]+[-])*[a-zA-Z]+$/;

const UpdateProjectForm: React.FC<UpdateProjectFormProps> = ({ project }) => {
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
        <button disabled={hasSameTags(project.tags, upperRowTags)} onClick={handleUpdateTags}>Update</button>
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
  const title = project.title
    .replaceAll(/\[x\]|\[X\]|- |\[ \]/g, '');

  useEffect(() => {
    setShowDetails(false);
  }, [project]);

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

  const swapPosition = (project: Project, orderInfo: OrderInfo[], direction: 'up' | 'down') => {
    const currentOrderInfo = orderInfo.find((item) => item._id === project._id);
    if (currentOrderInfo === undefined || currentOrderInfo.order === undefined) return;

    const targetIndex = direction === 'up' ? currentOrderInfo.index - 1 : currentOrderInfo.index + 1;
    const targetOrderInfo = orderInfo.find((item) => item.index === targetIndex);

    if (targetOrderInfo === undefined || targetOrderInfo.order === undefined) return;

    ProjectActor.send({
      type: 'UPDATE',
      updatedResources: [
        { _id: project._id, order: targetOrderInfo.order },
        { _id: targetOrderInfo._id, order: currentOrderInfo.order },
      ],
    });
  };

  const handleSwapPositionUp = () => {
    if (!orderInfo) return;
    swapPosition(project, orderInfo, 'up');
  }

  const handleSwapPositionDown = () => {
    if (!orderInfo) return;
    swapPosition(project, orderInfo, 'down');
  }

  const openModal = () => {
    ProjectUIActor.send({ type: 'OPEN_UPDATE_MODAL', resource: project });
  }

  const HeaderTags = () => (
    <Popover
      content={(
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <UpdateProjectForm project={project} />
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
    <div style={{ padding: '10px', border: '1px solid white', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1' }}>
          <h4
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={toggleDetails}
          >
            {title}
          </h4>
          <div>
            <button
              className="icon-button"
              onClick={copyToClipboard}
              >
              <AiOutlineCopy />
            </button>
          </div>
          <div>
            <button
              className="icon-button"
              onClick={openModal}
            >
              <AiOutlineEdit />
            </button>
          </div>
          {showHeaderTags && !showDetails && (<HeaderTags />)}
        </div>
        {orderInfo && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="icon-button" onClick={handleSwapPositionUp}><AiOutlineCaretUp /></button>
            <button className="icon-button" onClick={handleSwapPositionDown}><AiOutlineCaretDown /></button>
          </div>
        )}
      </div>
      {showDetails && (
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
          <div>
            <HeaderTags />
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectView;