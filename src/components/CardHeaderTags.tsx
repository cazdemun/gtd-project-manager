import { ProjectActor } from "@/app/resources";
import React, { useEffect, useState } from "react";
import { Popover, Row } from "@/app/ui";
import { getTagsAndCount } from "@/utils";
import { useSelector } from "@xstate/react";
import { VALID_TAG_REGEX } from "@/utils/constants";

const isEqual = (tagsA: string[], tagsB: string[]): boolean => {
  if (tagsA.length !== tagsB.length) return false;
  return tagsA.every((tag) => tagsB.includes(tag));
}

type UpdateProjectFormProps = {
  project: Project;
}

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

type CardHeaderTagsProps = {
  project: Project;
  showPopover?: boolean;
}

const CardHeaderTags: React.FC<CardHeaderTagsProps> = ({ project, showPopover = true }) => {
  return (
    <Popover
      content={showPopover ? (
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <UpdateTagsForm project={project} />
        </div>
      ) : null}
    >
      <Row gap={10} centerY style={{ cursor: showPopover ? 'pointer' : 'text', flexWrap: 'wrap' }}>
        {project.tags.length > 0
          ? project.tags.map((tag, i) => (<pre key={i}>{tag}</pre>))
          : (<pre>[no tags]</pre>)
        }
      </Row>
    </Popover>
  );
};

export default CardHeaderTags;