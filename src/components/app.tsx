'use client';

import React from "react";
import Header from "./Header";
import { AppActor } from "@/app/machines/appMachine";
import { useSelector } from "@xstate/react";
import ProjectsPage from "./ProjectsPage";
import PeriodicProjectsPage from "./PeriodicProjectsPage";
import ProjectUpdateModal from "./ProjectUpdateModal";
import { FloatingButton } from "@/app/ui";

import "@/styles/common.scss"

export default function App() {
  const isProjectsPage = useSelector(AppActor, (state) => state.matches('projectsPage'));
  const isPeriodicProjectsPage = useSelector(AppActor, (state) => state.matches('periodicProjectsPage'));

  return (
    <>
      <Header />
      {isProjectsPage && <ProjectsPage />}
      {isPeriodicProjectsPage && <PeriodicProjectsPage />}
      <FloatingButton />
      <ProjectUpdateModal />
    </>
  );
}
