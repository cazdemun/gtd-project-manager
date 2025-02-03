import { useState } from "react";
import { AppActor } from "@/app/machines/appMachine";
import { ProjectActor } from "@/app/resources";
import { Row, Col } from "@/app/ui";
import { getTitleText, withConfirmation } from "@/utils";
import { textProjectToText } from "@/utils/repository";
import { useSelector } from "@xstate/react";
import { VALID_TAG_REGEX } from "@/utils/constants";

const getProjectsFromIds = (projectsMap: Map<string, Project>) => (selectedProjects: string[]) => {
  return selectedProjects
    .map((id) => projectsMap.get(id))
    .filter((project): project is Project => project !== undefined);
}

const getCommonTags = (projects: Project[]): string[] => {
  if (projects.length === 0) return [];
  return projects.reduce((commonTags, project) => {
    if (commonTags === undefined) return project.tags;
    return commonTags.filter((tag) => project.tags.includes(tag));
  }, undefined as string[] | undefined) || [];
}

type BulkOperationsBarProps = object

const BulkOperationsBar: React.FC<BulkOperationsBarProps> = () => {
  const [showBar, setShowBar] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string>('');

  const selectMode = useSelector(AppActor, (state) => state.matches({ projectsPage: 'select' }) || state.matches({ periodicProjectsPage: 'select' }));
  const selectedProjects = useSelector(AppActor, (state) => state.context.selectedProjectIds);

  const projects = useSelector(ProjectActor, (state) => state.context.resources);
  const projectsMap = useSelector(ProjectActor, (state) => state.context.resourcesMap);
  const _getProjectsFromIds = getProjectsFromIds(projectsMap);

  const commonTags = [...new Set(getCommonTags(_getProjectsFromIds(selectedProjects)))];
  const availableTags = [...new Set(
    projects
      .map((project) => project.tags)
      .flat()
  )].filter((tag) => !commonTags.includes(tag));

  const toggleShowBar = () => {
    setShowBar((prev) => !prev);
  }

  const handleSelectToggle = () => {
    AppActor.send({ type: selectMode ? 'IDLE_PROJECTS_MODE' : 'SELECT_PROJECTS_MODE' });
  };

  const handleClearSelected = () => {
    AppActor.send({ type: 'CLEAR_SELECTED_PROJECT_IDS' });
  };

  const _updateProgressBulk = (progress: " " | "x" | "?") => {
    const projectsToUpdate = _getProjectsFromIds(selectedProjects)
      .map((project) => {
        const title = getTitleText(project.title);
        const newTitle = `- [${progress}] ${title}`;
        return {
          _id: project._id,
          title: newTitle,
          done: progress === 'x' ? Date.now() : undefined,
        }
      });
    ProjectActor.send({
      type: 'UPDATE',
      updatedResources: projectsToUpdate,
      afterUpdate: () => handleClearSelected(),
    });
  }

  const doneProjectBulk = () => {
    _updateProgressBulk('x');
  }

  const pendingProjectBulk = () => {
    _updateProgressBulk(' ');
  }

  const incubatedProjectBulk = () => {
    _updateProgressBulk('?');
  }

  const handleExport = () => {
    const serializedProjects = _getProjectsFromIds(selectedProjects)
      .map(textProjectToText)
      .join('\n\n');
    navigator.clipboard.writeText(serializedProjects).then(() => {
      alert('Selected projects copied to clipboard');
    });
  };

  const handleManyDelete = () => {
    withConfirmation('Are you sure you want to delete these projects?', () => {
      ProjectActor.send({
        type: 'DELETE',
        resourceIds: selectedProjects,
        afterDelete: () => handleClearSelected(),
      });
    });
  }

  const removeTagBulk = (tag: string) => {
    withConfirmation(`Are you sure you want to remove the tag: ${tag}`, () => {
      const projectsToUpdate = _getProjectsFromIds(selectedProjects)
        .map((project) => ({ _id: project._id, tags: project.tags.filter((t) => t !== tag), }))
      ProjectActor.send({
        type: 'UPDATE',
        updatedResources: projectsToUpdate,
        afterUpdate: () => handleClearSelected(),
      });
    });
  }

  const addTagBulk = (tag: string) => {
    if (selectedProjects.length < 1) return;
    const newTag = tag.startsWith('#') ? tag : `#${tag}`;
    const projectsToUpdate = _getProjectsFromIds(selectedProjects)
      .map((project) => ({ _id: project._id, tags: [...new Set([...project.tags, newTag])] }));
    ProjectActor.send({
      type: 'UPDATE',
      updatedResources: projectsToUpdate,
      afterUpdate: () => handleClearSelected(),
    });
  }

  return (
    <Col gap={8} centerY style={{ borderRadius: "5px", border: "1px solid #fff", padding: "8px" }}>
      <h3 onClick={toggleShowBar} style={{ cursor: 'pointer' }}>
        Bulk Operations
      </h3>
      {showBar && (
        <Col gap={10}>
          <Row gap={10} centerY style={{ padding: "0px 8px", flexWrap: "wrap" }}>
            <button onClick={handleSelectToggle}>{selectMode ? `Cancel select (${selectedProjects.length})` : 'Select'}</button>
            {selectMode && (<>
              <hr style={{ alignSelf: 'stretch' }} />
              <button onClick={handleExport}>Export</button>
              <button onClick={handleManyDelete}>Delete</button>
              <hr style={{ alignSelf: 'stretch' }} />
              <button onClick={doneProjectBulk}>Done</button>
              <button onClick={pendingProjectBulk}>Progress</button>
              <button onClick={incubatedProjectBulk}>Incubated</button>
            </>)}
          </Row>
          {selectMode && (
            <>
              <Row gap={10} centerY style={{ padding: "0px 8px", flexWrap: "wrap" }}>
                <label>Remove tags:</label>
                {commonTags.map((tag) => (
                  <button key={tag} onClick={() => removeTagBulk(tag)}>{tag}</button>
                ))}
              </Row>
              <Row gap={10} centerY style={{ padding: "0px 8px", flexWrap: "wrap" }}>
                <label>Add tags:</label>
                {availableTags.map((tag) => (
                  <button disabled={selectedProjects.length < 1} key={tag} onClick={() => addTagBulk(tag)}>{tag}</button>
                ))}
              </Row>
              <Row gap={10} centerY style={{ padding: "0px 8px", flexWrap: "wrap" }}>
                <label>Add new tag:</label>
                <form
                  style={{ display: 'flex', gap: '10px' }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (error !== '') return;
                    if (newTag.match(VALID_TAG_REGEX)) addTagBulk(newTag);
                  }}
                >
                  <input
                    type="text" placeholder="New tag"
                    style={{ borderColor: error !== '' ? 'red' : 'gray', width: '200px', padding: '0px 5px' }}
                    value={newTag}
                    onChange={(e) => {
                      setNewTag(e.target.value);
                      if (e.target.value.match(VALID_TAG_REGEX) || e.target.value === '') {
                        setError('');
                      } else {
                        setError('Invalid tag');
                      }
                    }}
                    onBlur={() => {
                      if (newTag === '') setError('')
                    }}
                  />
                  <button type="submit" disabled={!newTag.match(VALID_TAG_REGEX) || error !== '' || selectedProjects.length < 1}>Add</button>
                </form>
              </Row>
            </>
          )}
        </Col>
      )}
    </Col>
  );
};

export default BulkOperationsBar;