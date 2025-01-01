'use client';

import React, { useEffect, useState } from "react";
import { convertProjectsToRawText } from "@/utils";
import FloatingButton from "./floating-button";
import { useSelector } from "@xstate/react";
import { ProjectActor } from "@/app/resources";

const updateRawText = async (text: string, onSuccess: () => void) => {
  try {
    const response = await fetch('/api/raw-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    const { success } = await response.json();
    if (success) {
      console.log('Projects saved successfully.');
      onSuccess();
    } else {
      console.error('Failed to save projects.');
    }
  } catch (error) {
    console.error('Error saving projects:', error);
  }
}

type TagFilterState = {
  state: 'tagless' | 'tagged' | 'all';
  label: string;
}

const tagFilterStates: Record<TagFilterState['state'], TagFilterState> = {
  all: { state: 'all', label: 'All' },
  tagless: { state: 'tagless', label: 'Tagless' },
  tagged: { state: 'tagged', label: 'Tagged' },
}

type DoneFilterState = {
  state: 'done' | 'pending' | 'all';
  label: string;
}

const doneFilterStates: Record<DoneFilterState['state'], DoneFilterState> = {
  all: { state: 'all', label: 'All' },
  done: { state: 'done', label: 'Done' },
  pending: { state: 'pending', label: 'Pending' },
}

type ProjectViewProps = {
  project: Project;
  showHeaderTags?: boolean;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, showHeaderTags }) => {
  const [showDetails, setShowDetails] = useState(false);
  const title = project.title
    .replaceAll(/\[x\]|\[X\]|- |\[ \]/g, '');

  useEffect(() => {
    setShowDetails(false);
  }, [project]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(title)
      .then(() => {
        console.log('Title copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy title: ', err);
      });
  };

  return (
    <div style={{ padding: '10px', border: '1px solid white', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h4 onClick={copyToClipboard} style={{ cursor: 'pointer' }}>{title}</h4>
        {showHeaderTags && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {project.tags.map((tag, i) => (
              <pre key={i}>{tag}</pre>
            ))}
          </div>
        )}
        {!showDetails && (
          <div>
            <button onClick={() => setShowDetails((prev) => !prev)} style={{ padding: '5px 10px' }}>Show details</button>
          </div>
        )}
      </div>
      {showDetails && (
        <>
          <div>
            <button onClick={() => setShowDetails((prev) => !prev)} style={{ padding: '5px 10px' }}>Hide details</button>
          </div>
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
          {project.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {project.tags.map((tag, i) => (<pre key={i}>{tag}</pre>))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function App() {
  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const tags = [...new Set(projects.map((project) => project.tags).flat())]

  const [doneFilter, setDoneFilter] = React.useState<DoneFilterState>(doneFilterStates['pending']);
  const [tagFilter, setTagFilter] = React.useState<TagFilterState>(tagFilterStates['tagless']);

  const [tagSelected, setTagSelected] = React.useState<string | undefined>(undefined);

  const filteredProjects = projects
    .filter((project) => {
      if (tagFilter.state === 'all') {
        return true;
      } else if (tagFilter.state === 'tagless') {
        return project.tags.length === 0;
      } else {
        return project.tags.length > 0;
      }
    })
    .filter((project) => {
      if (doneFilter.state === 'all') {
        return true;
      } else if (doneFilter.state === 'done') {
        return project.title.includes('[x]') || project.title.includes('[X]');
      } else {
        return !(project.title.includes('[x]') || project.title.includes('[X]'));
      }
    });

  const tagSelectedProjects = filteredProjects
    .filter((project) => {
      if (tagSelected === undefined) {
        return false;
      } else {
        return project.tags.includes(tagSelected);
      }
    });

  const toggleDoneFilter = () => {
    setDoneFilter((prev) => {
      if (prev.state === 'all') {
        return doneFilterStates['done'];
      } else if (prev.state === 'done') {
        return doneFilterStates['pending'];
      } else {
        return doneFilterStates['all'];
      }
    });
  }

  const toggleTagFilter = () => {
    setTagFilter((prev) => {
      if (prev.state === 'all') {
        return tagFilterStates['tagless'];
      } else if (prev.state === 'tagless') {
        return tagFilterStates['tagged'];
      } else {
        return tagFilterStates['all'];
      }
    });
  }

  const selectTag = (tag: string) => {
    if (tagSelected === tag) setTagSelected(undefined);
    else setTagSelected(tag);
  }

  const loadProjects = () => {
    ProjectActor.send({ type: 'FETCH' })
  }

  const saveRawProjects = async () => {
    const updatedRawText = convertProjectsToRawText(projects);
    updateRawText(updatedRawText, loadProjects);
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={loadProjects} style={{ padding: '5px 10px' }}>Load projects</button>
        <button onClick={saveRawProjects} style={{ padding: '5px 10px' }}>Save (and format) projects</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2>Filters</h2>
        <hr />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Progress status:</span>
          <button onClick={toggleDoneFilter} style={{ padding: '5px 10px' }}>{doneFilter.label}</button>
          <span>Tagged status:</span>
          <button onClick={toggleTagFilter} style={{ padding: '5px 10px' }}>{tagFilter.label}</button>
        </div>
      </div>
      <hr />
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredProjects.map((project, i) => (<ProjectView key={i} project={project} showHeaderTags />))}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {tags.map((tag, i) => (
              <div key={i} onClick={() => selectTag(tag)} style={{ cursor: 'pointer' }}>
                <button
                  style={{ padding: '10px', backgroundColor: tagSelected === tag ? 'gray' : 'black', color: 'white', borderRadius: ' 5px 5px 0px 0px' }}
                >
                  {tag}
                </button>
              </div>
            ))}
          </div>
          {tagSelectedProjects.map((project, i) => (<ProjectView key={i} project={project} />))}
        </div>
      </div>
      <FloatingButton />
    </div >
  );
}
