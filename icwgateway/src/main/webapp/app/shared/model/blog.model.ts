export interface IBlog {
  id?: number;
  name?: string;
  handle?: string;
  userId?: number;
}

export const defaultValue: Readonly<IBlog> = {};
