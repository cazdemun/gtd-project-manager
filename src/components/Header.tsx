import React, { useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { SourceActor } from '@/app/resources';
import { useSelector } from '@xstate/react';
import Sidebar from './Sidebar';
import { AppActor, MachineEvent as AppMachineEvent } from '@/app/machines/appMachine';
import { Row } from '@/app/ui';

import "./Header.scss";

// We could exclude all non-navigation events, but we'll just exclude the ones that need additional inputs
type EventType = Exclude<AppMachineEvent['type'], 'SELECT_PROJECT'>;

type HeaderProps = object

const Header: React.FC<HeaderProps> = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const sources = useSelector(SourceActor, ({ context }) => context.resources);
  const currentSource = sources.find((source) => source.selected);

  const isProjectsPage = useSelector(AppActor, (state) => state.matches('projectsPage'));
  const isPeriodicProjectsPage = useSelector(AppActor, (state) => state.matches('periodicProjectsPage'));
  const isGptPage = useSelector(AppActor, (state) => state.matches('gptPage'));

  const showSidebar = () => {
    setSidebarVisible(true);
    SourceActor.send({ type: 'FETCH' });
  }

  const hideSidebar = () => {
    setSidebarVisible(false);
  }

  const HeaderElement = ({ selected, value, text, disabled }: { selected: boolean, value: EventType, text: string, disabled?: boolean }) => {
    const cursor = disabled ? 'not-allowed' : selected ? 'default' : 'pointer';
    const color = disabled ? 'gray' : 'white';
    const goPage = () => AppActor.send({ type: value });
    return (
      <span
        style={{ cursor, color }}
        onClick={() => !disabled && goPage()}
      >
        {selected ? <strong>{text}</strong> : text}
      </span>
    );
  }

  return (
    <header className="header">
      <Row centerY gap={20}>
        <AiOutlineMenu style={{ cursor: 'pointer' }} onClick={showSidebar} />
        <span>{currentSource ? currentSource.title : '[No source selected]'}</span>
        <Row centerY gap={10}>
          <HeaderElement selected={isProjectsPage} value="GO_PROJECTS" text="Projects" />
          <hr style={{ alignSelf: 'stretch' }} />
          <HeaderElement selected={isPeriodicProjectsPage} value="GO_PERIODIC_PROJECTS" text="Periodic Projects" />
          <hr style={{ alignSelf: 'stretch' }} />
          <HeaderElement selected={isGptPage} value="GO_GPT" text="GPT" disabled />
        </Row>
      </Row>
      <Sidebar visible={sidebarVisible} onClose={hideSidebar} />
    </header >
  );
};

export default Header;