type Resource = { _id: string; };
type NewResource<T extends Resource> = Partial<Pick<T, '_id'>> & Omit<T, '_id'>;
type UpdatableResource<T extends Resource> = Pick<T, '_id'> & Partial<Omit<T, '_id'>>;

interface Repository<T extends Resource> {
  read: () => Promise<T[]>;
  create: (newDocs: NewResource<T> | NewResource<T>[]) => Promise<T[]>;
  update: (_id: string, updatedDoc: Partial<T>) => Promise<number>;
  updateMany: (docs: UpdatableResource<T>[]) => Promise<number>;
  delete: (_id: string) => Promise<number>;
  deleteMany: (_ids: string[]) => Promise<number>;
}
