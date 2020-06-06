import { IPictureService } from './../interfaces/IPictureService';
import { SPHttpClient ,SPHttpClientResponse} from '@microsoft/sp-http';
import { IPictureInfo } from '../interfaces/IPictureInfo';
import { PictureInfo } from './../models/PictureInfo';
import { injectable } from 'react-inversify';
import { ISPHttpClientOptions} from '@microsoft/sp-http';
import { ODataResponseKeys } from '../Enum/EODataResponse';

@injectable()
export class PictureService implements IPictureService {
    Delete = (id: number, spHttpClient: SPHttpClient, siteUrl: string): Promise<boolean> => {
        var url = `${siteUrl}/_api/web/lists/getbytitle('Address Book Profile Image')/items('${id}')/File?$select=ServerRelativeUrl`;
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, {
            headers: { 'accept': 'application/json' }
        }).then(result => {
            if (!result.ok)
                throw Error('Cannot Delete File,Bad Response . . .')
            return result.json();
        }).then(res => {
            const url: string = `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${res['ServerRelativeUrl']}')`;
            const options: ISPHttpClientOptions = {
                method: 'DELETE',
                headers: {
                    'X-HTTP-Method': 'DELETE',
                    'If-Match': '*'
                }
            };
            return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then(response => {
                if (!response.ok)
                    throw new Error('Serve Bad Response . . .');
                return true;
            })
        });
}
    GetNameById = (Id: number,spHttpClient:SPHttpClient): Promise<string> => {
        var url = `https://practisebest555.sharepoint.com/sites/apps/_api/web/lists/getbytitle('Address Book Profile Image')/items('${Id}')/File`;
        const options: ISPHttpClientOptions = {
            headers: {
                'accept': 'application/json'
            }
        };
       return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then(res => {
            debugger;
            if (!res.ok)
                throw new Error('Cannot Fetch Picture Info');
           return res.json();
       }).then(response => {

           const name: string = response[ODataResponseKeys.Name];
           return name;
        });
    }
    Upload = (spHttpClient: SPHttpClient, siteUrl: string, file: ArrayBuffer, fileName: string): Promise<IPictureInfo> => {
        var url = `https://practisebest555.sharepoint.com/sites/apps/_api/web/lists/getbytitle('Address Book Profile Image')/RootFolder/Files/Add(url='${fileName}',overwrite=true)?$expand=ListItemAllFields`;
        return spHttpClient.post(url, SPHttpClient.configurations.v1, {
            body: file,
        }).then(res => {
            if (!res.ok)
                throw new Error('Server Error in Uploaded');
            return res.json();
        }).then(res => {
            debugger;
            const { ServerRelativeUrl, Name } = res;
            const { [ODataResponseKeys.ID]: Id } = res['ListItemAllFields'];
            let pictureInfo: IPictureInfo = new PictureInfo(Name, ServerRelativeUrl, Id);
            return pictureInfo;
        });
    }
} 