import React, { useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { SourceActor } from '@/app/resources';
import { useSelector } from '@xstate/react';
import Sidebar from './Sidebar';

import "./Header.scss";

type HeaderProps = object

const Header: React.FC<HeaderProps> = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const sources = useSelector(SourceActor, ({ context }) => context.resources);
  const currentSource = sources.find((source) => source.selected);

  const showSidebar = () => {
    setSidebarVisible(true);
    SourceActor.send({ type: 'FETCH' });
  }

  const hideSidebar = () => {
    setSidebarVisible(false);
  }

  return (
    <div className="header">
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <AiOutlineMenu style={{ cursor: 'pointer' }} onClick={showSidebar} />
        {currentSource && <span>{currentSource.title}</span>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ cursor: 'pointer' }}><strong>Projects</strong></span>
          <hr />
          <span style={{ cursor: 'pointer', color: 'gray' }}>Periodic Projects</span>
          <hr />
          <span style={{ cursor: 'pointer', color: 'gray' }}>Explorer</span>
        </div>
      </div>
      <Sidebar visible={sidebarVisible} onClose={hideSidebar} />
    </div>
  );
};

export default Header;