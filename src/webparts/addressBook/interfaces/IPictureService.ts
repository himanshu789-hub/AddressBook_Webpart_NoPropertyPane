import { IAddressItem } from './IAddressItem';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http'; 
import { IPictureInfo } from './IPictureInfo';

export interface IPictureService
{
        Delete: (id: number, spHttpClient: SPHttpClient, siteUrl: string) => Promise<boolean>;
        GetNameById: (Id: number, spHttpClient: SPHttpClient)=>Promise<string> ;
        Upload: (spHttpClient: SPHttpClient, siteUrl: string, file: ArrayBuffer,fileName:string) => Promise<IPictureInfo>;
}
