import { IURLField } from "./IURLField";
import { IPictureInfo } from "./IPictureInfo";

export interface IAddressItem{
    Id: number;
    FullName: string;
    Email: string;
    CellPhone: string;
    Picture: IURLField;
    WorkAddress: string;
    Website: IURLField;
    Etag: number;
    PictureId: number;
}
