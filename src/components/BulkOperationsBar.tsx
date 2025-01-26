import { AppActor } from "@/app/machines/appMachine";
import { ProjectActor } from "@/app/resources";
import { Row, Col } from "@/app/ui";
import { extracTitleText } from "@/utils";
import { textProjectToText } from "@/utils/repository";
import { useSelector } from "@xstate/react";

type BulkOperationsBarProps = object

const BulkOperationsBar: React.FC<BulkOperationsBarProps> = () => {
  const selectMode = useSelector(AppActor, (state) => state.matches({ projectsPage: 'select' }));
  const selectedProjects = useSelector(AppActor, (state) => state.context.selectedProjectIds);
  const projectsMap = useSelector(ProjectActor, (state) => state.context.resourcesMap);

  const handleSelectToggle = () => {
    AppActor.send({ type: selectMode ? 'IDLE_PROJECTS_MODE' : 'SELECT_PROJECTS_MODE' });
  };

  const handleClearSelected = () => {
    AppActor.send({ type: 'CLEAR_SELECTED_PROJECT_IDS' });
  };

  const _updateProgressBulk = (progress: " " | "x" | "?") => {
    const projectsToUpdate = selectedProjects
      .map((id) => projectsMap.get(id))
      .filter((project): project is Project => project !== undefined)
      .map((project) => {
        const title = extracTitleText(project.title);
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
    const serializedProjects = selectedProjects
      .map((id) => projectsMap.get(id))
      .filter((project): project is Project => project !== undefined)
      .map(textProjectToText)
      .join('\n\n');
    navigator.clipboard.writeText(serializedProjects).then(() => {
      alert('Selected projects copied to clipboard');
    });
  };

  const handleManyDelete = () => {
    const confirmation = window.confirm('Are you sure you want to delete these projects?');
    if (confirmation) {
      ProjectActor.send({
        type: 'DELETE',
        resourceIds: selectedProjects,
        afterDelete: () => handleClearSelected(),
      });
    }
  }

  return (
    <Col gap={10}>
      <h2>Bulk Operations</h2>
      <hr style={{ alignSelf: 'stretch' }} />
      <Row gap={10} centerY>
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
    </Col>
  );
};

export default BulkOperationsBar;