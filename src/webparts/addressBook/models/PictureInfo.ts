import { IPictureInfo } from "../interfaces/IPictureInfo";

export class PictureInfo implements IPictureInfo{
    ImageName: string;
    ImageUri: string;
    constructor(name: string, uri: string,Id:number)
    {
        this.ImageName = name;
        this.ImageUri = uri;
        this.Id = Id;
    }
    Id: number;
}