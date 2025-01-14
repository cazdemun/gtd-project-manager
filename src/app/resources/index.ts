import { createResourceActor } from "@/lib/ResourceMachine";
import { createResourceUIActor } from "../machines/resourceUIMachine";

export const ProjectActor = createResourceActor<Project>('projects');
ProjectActor.start();
export const ProjectUIActor = createResourceUIActor<Project>();
ProjectUIActor.start();

export const SourceActor = createResourceActor<Source>('sources');
SourceActor.start();
