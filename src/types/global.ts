/* eslint-disable @typescript-eslint/no-wrapper-object-types */
export interface IHasId extends Object {
  id: number;
}

export interface IHasUuid extends Object {
  uuid: string;
}

export interface IHasSortOrder extends Object {
  sortOrder: number;
}

export type TFormErrors<T> = {
  [K in keyof T]: string;
};
