import { createResourceActor } from "@/lib/ResourceMachine";

export const ProjectActor = createResourceActor<Project>('projects');
ProjectActor.start();