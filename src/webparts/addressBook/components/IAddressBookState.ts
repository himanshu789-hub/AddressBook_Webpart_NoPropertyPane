import { IAddressItem } from "../interfaces/IAddressItem";

export interface IAddressBookState {
  statusDescription: string;
  statusClass: string;
  IsStateSetFromGetByForm: boolean;
  IsStateSetFromGetByList: boolean;
  IsStateSetFromGetByDisplay: boolean;
}

