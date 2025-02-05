'use client';

import React from "react";
import Header from "./Header";
import { AppActor } from "@/app/machines/appMachine";
import { useSelector } from "@xstate/react";
import ProjectsPage from "./ProjectsPage";
import PeriodicProjectsPage from "./PeriodicProjectsPage";
import ProjectCreateModal from "./ProjectCreateModal";
import ProjectUpdateModal from "./ProjectUpdateModal";
import TagManagerModal from "./modals/TagManagerModal";
import { FloatingButton } from "@/app/ui";
import { TagsColorsProvider } from "@/hooks/useTagColors";

import "@/styles/common.scss"

export default function App() {
  const isProjectsPage = useSelector(AppActor, (state) => state.matches('projectsPage'));
  const isPeriodicProjectsPage = useSelector(AppActor, (state) => state.matches('periodicProjectsPage'));

  return (
    <TagsColorsProvider>
      <Header />
      {isProjectsPage && <ProjectsPage />}
      {isPeriodicProjectsPage && <PeriodicProjectsPage />}
      <FloatingButton />
      <ProjectCreateModal />
      <ProjectUpdateModal />
      <TagManagerModal />
    </TagsColorsProvider>
  );
}
