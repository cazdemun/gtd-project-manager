'use client';

import React, { FormEvent, MouseEvent } from 'react';
import { useSelector } from '@xstate/react';
import { AiOutlineCloseCircle, AiOutlineDelete } from 'react-icons/ai';
import { ProjectActor, RecordActor, SourceActor } from '@/app/resources';

import './Sidebar.scss';

type CreateSourceModalProps = {
  title: string;
  setTitle: (title: string) => void;
  path: string;
  setPath: (path: string) => void;
  slug: string;
  setSlug: (path: string) => void;
  createSource: (e: FormEvent<HTMLFormElement>) => void;
}

const CreateSourceModal = ({ title, setTitle, path, setPath, slug, setSlug, createSource }: CreateSourceModalProps) => {
  return (
    <div>
      <form onSubmit={createSource} style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label>Title:</label>
          <input type="text" style={{ flex: 1 }} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label>Path:</label>
          <input type="text" style={{ flex: 1 }} value={path} onChange={(e) => setPath(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label>Slug:</label>
          <input type="text" style={{ flex: 1 }} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

type SidebarProps = {
  visible: boolean;
  onClose: (event?: MouseEvent) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const sources = useSelector(SourceActor, ({ context }) => context.resources);
  const [title, setTitle] = React.useState('');
  const [path, setPath] = React.useState('');
  const [slug, setSlug] = React.useState('');

  const createSource = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (title === '' || title === undefined || title === null) return;
    if (path === '' || path === undefined || path === null) return;
    if (slug === '' || slug === undefined || slug === null) return

    const newSource: NewResource<Source> = {
      title,
      path,
      slug,
      description: '',
      order: sources.reduce((max, source) => Math.max(max, source.order), 0) + 1,
    }

    SourceActor.send({ type: 'CREATE', newResources: newSource });
    setTitle('');
    setPath('');
    setSlug('');
  }

  const loadSources = () => {
    SourceActor.send({ type: 'FETCH' });
  }

  const deleteSource = (source: Source) => {
    const confirmation = window.confirm(`Are you sure you want to delete the source ${source.title}?`);
    if (confirmation) {
      SourceActor.send({ type: 'DELETE', resourceIds: [source._id] })
    }
  }

  const selectSource = async (source: Source) => {
    const updatedSources = sources.map((s) => {
      if (s._id === source._id) return { ...s, selected: true };
      return { ...s, selected: false };
    });

    SourceActor.send({
      type: 'UPDATE',
      updatedResources: updatedSources,
      afterUpdate: () => {
        ProjectActor.send({ type: 'FETCH' });
        RecordActor.send({ type: 'FETCH' });
        onClose();
      }
    });
  }

  return (
    <>
      {visible && <div className="overlay" onClick={onClose}></div>}
      <div className={`sidebar ${visible ? 'visible' : ''}`}>
        <button onClick={onClose} className="close-btn"><AiOutlineCloseCircle width="20px" height="20px" /></button>
        <div className="sidebar-content">
          <h2>Sources</h2>
          <button onClick={loadSources}>Load sources</button>
          <CreateSourceModal
            title={title}
            setTitle={setTitle}
            path={path}
            setPath={setPath}
            slug={slug}
            setSlug={setSlug}
            createSource={createSource}
          />
          {sources.length === 0 && <p>No sources found</p>}
          {sources.length > 0 && sources.map((source) => (
            <div key={source._id}>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  backgroundColor: source.selected ? 'lightgray' : 'transparent',
                }}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'column', flex: 1, cursor: 'pointer' }}
                  onClick={() => selectSource(source)}
                >
                  <h3>{source.title}</h3>
                  <p style={{ wordBreak: 'break-all', fontSize: '12px' }}>{source.path}</p>
                </div>
                <div>
                  <button className="icon-button" onClick={() => deleteSource(source)}>
                    <AiOutlineDelete />
                  </button>
                </div>
              </div>
              <hr />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;