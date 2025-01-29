import { createResourceActor } from "@/lib/ResourceMachine";
import { createResourceUIActor } from "../machines/resourceUIMachine";

type ProjectCreateOptions = {
  defaultTag?: string;
}

export const ProjectActor = createResourceActor<Project>('projects');
ProjectActor.start();
export const ProjectUIActor = createResourceUIActor<Project, ProjectCreateOptions>();
ProjectUIActor.start();

export const SourceActor = createResourceActor<Source>('sources');
SourceActor.start();

export const RecordActor = createResourceActor<DoneRecord>('records');
RecordActor.start();