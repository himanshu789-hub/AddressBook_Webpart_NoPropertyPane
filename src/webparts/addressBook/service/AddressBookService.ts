import { IAddressBookService } from '../interfaces/IAddressBookService';
import { IAddressItem } from '../interfaces/IAddressItem';
import { SPHttpClient, SPHttpClientResponse,ODataVersion,ISPHttpClientOptions,SPHttpClientConfiguration} from '@microsoft/sp-http';
import { injectable } from 'react-inversify';
import { listName } from './../constants/constants';
import { AddressItem } from '../models/AddressItem';
import { ListItem } from './../models/ListItem';
import {ODataResponseKeys } from '../Enum/EODataResponse';
@injectable()
export class AddressBookService implements IAddressBookService {
public	GetById = (id: number, spHttpClient: SPHttpClient, siteURL: string): Promise<IAddressItem> => {
		const Url = `${siteURL}/_api/web/lists/getbytitle('${listName}')/items('${id}')`;
	return spHttpClient
		.get(Url, SPHttpClient.configurations.v1)
		.then((res: SPHttpClientResponse) => {
			if (!res.ok)
				throw new Error('Serve Response Error : ' + res.statusText + '(' + res.status + ')');
			return res.json();
		})
		.then((res): IAddressItem => {
		    let listItem: IAddressItem = new AddressItem();
			const FullName:string = res[ODataResponseKeys.FullName]; 
			const CellPhone: string = res[ODataResponseKeys.CellPhone];
			const ID: string = res[ODataResponseKeys.ID];
			const EMail: string = res[ODataResponseKeys.Email]; 
			const website_url:string = res[ODataResponseKeys.URLField][ODataResponseKeys.UrlFeildValue];
			const website_description:string = res[ODataResponseKeys.URLField][ODataResponseKeys.UrlFieldDescription];
			const WorkAddress: string = res[ODataResponseKeys.Address]; 
			const picture_url: string = res[ODataResponseKeys.PictureField]==null?'':res[ODataResponseKeys.PictureField][ODataResponseKeys.PictureFeildValue];
			const picture_description: string = res[ODataResponseKeys.PictureField]==null?'':res[ODataResponseKeys.PictureField][ODataResponseKeys.PictureFieldDescription];
			const etag: string = JSON.parse(res[ODataResponseKeys.OdataEtag]);	
			listItem.FullName = FullName;
			listItem.Email = EMail;
			listItem.CellPhone = CellPhone;
			listItem.Id = parseInt(ID);
			listItem.PictureId = res[ODataResponseKeys.PictureId];
			listItem.WorkAddress = WorkAddress;
			listItem.Picture.Description = picture_description;
			listItem.Website.Description = website_description;
			listItem.Picture.Url = picture_url;
			listItem.Website.Url = website_url;
			listItem.Email = EMail;
			listItem.Etag = parseInt(etag);
			return listItem;
		});
	}
    public	Create = (contact: IAddressItem, shttpClient: SPHttpClient, siteURL: string): Promise<IAddressItem> => {
		const Url = `${siteURL}/_api/web/lists/getbytitle('Address Book')/items`;
       
		let body: string = JSON.stringify({
			'FullName': contact.FullName,
			'EMail': contact.Email,
			'CellPhone': contact.CellPhone,
			'URL': {
				'Description': contact.FullName+"'s Website",
				'Url': contact.Website.Url,
			},
			'DisplayTemplateJSIconUrl': {
				'Description':contact.FullName+"'s Profile Image",
				'Url': contact.Picture.Url
			},
			'WorkAddress': contact.WorkAddress,
			'PictureIdId':contact.PictureId
		});
		const options: ISPHttpClientOptions = {
			body: body,
			headers: {
				"Content-Type": "application/json","Accept":"application/json"
			}
		};
		return shttpClient
			.post(Url, SPHttpClient.configurations.v1,options)
			.then((res: SPHttpClientResponse) => {
				debugger;
				if (!res.ok)
					throw new Error("Cannot Add Item . . .");
				console.log('Item : ',res);
				return res.json();
			})
			.then((res) => {
					const ID: string = res[ODataResponseKeys.ID];
					contact.Id = parseInt(ID);
					const etag: string = JSON.parse(res[ODataResponseKeys.OdataEtag]);	
					contact.Etag = parseInt(etag);
					return contact;
				}
			);
	}
    public	Update = (contact: IAddressItem, shttpClient: SPHttpClient, siteURL: string): Promise<IAddressItem> => {
		const Url:string = `${siteURL}/_api/web/lists/getbytitle('Address Book')/items(${contact.Id})`;
		console.log(Url);
		let body: string = JSON.stringify({
			Id:contact.Id,
			FullName: contact.FullName,
			EMail: contact.Email,
			CellPhone: contact.CellPhone,
			URL: {
				Description:contact.Website.Description,
				Url: contact.Website.Url,
			},
			DisplayTemplateJSIconUrl: {
				Description: contact.Picture.Url,
				Url: contact.Picture.Url,
			},
			WorkAddress:contact.WorkAddress,
			PictureIdId:contact.PictureId
		});
		const options: ISPHttpClientOptions = {
			body: body,
			method: 'PATCH',
			headers: {
				'X-Http-Method': 'MERGE',
				'If-Match': '*',
				'content-type': 'application/json',
				'accept': 'application/json'
			}
		};
		return shttpClient
			.fetch(Url, SPHttpClient.configurations.v1, options)
			.then((res: SPHttpClientResponse) => {
				debugger;
				console.log('Update Response : ', res);
				if (!res.ok)
					throw new Error(`Serve Response Error : ${res.statusText}(${res.status})`);
				return contact;
			});
		
	}
    public	Delete = (etag: number,id:number, shttpClient: SPHttpClient, siteURL: string): Promise<boolean> => {
		const Url: string = `${siteURL}/_api/web/lists/getbytitle('${listName}')/items('${id}')`;
		debugger;
		return shttpClient
			.post(Url, SPHttpClient.configurations.v1, {
				headers: {
					'X-HTTP-Method': 'DELETE',
					'If-Match':'*'
				},
			})
			.then((res: SPHttpClientResponse): boolean => {
				if (!res.ok)
					return false;
				return true;
			});
			
	}
    public	GetAll = (shttpClient: SPHttpClient, siteURL: string): Promise<IAddressItem[]> => {
		const Url = `${siteURL}/_api/web/lists/getbytitle('${listName}')/items`;
		return shttpClient
			.get(Url, SPHttpClient.configurations.v1)
			.then((res: SPHttpClientResponse) => {
				console.log('Get All response : ', res);
				if (!res.ok)
					throw new Error("Serve Response Error : " + res.status);
				return res.json();
			})
			.then((response): IAddressItem[] => {
				const { value:results } = response;
				 
				let listItemArray: Array<IAddressItem> = new Array<AddressItem>();
				results.forEach((res, index) => {
					let listItem: IAddressItem = new AddressItem();
					const FullName:string = res[ODataResponseKeys.FullName]; 
					const CellPhone: string = res[ODataResponseKeys.CellPhone];
					const ID: string = res[ODataResponseKeys.ID];
					const EMail: string = res[ODataResponseKeys.Email]; 
					
					const website_url:string = res[ODataResponseKeys.URLField][ODataResponseKeys.UrlFeildValue];
					const website_description:string = res[ODataResponseKeys.URLField][ODataResponseKeys.UrlFieldDescription];
					const WorkAddress: string = res[ODataResponseKeys.Address]; 
					const picture_url: string = res[ODataResponseKeys.PictureField]==null?'':res[ODataResponseKeys.PictureField][ODataResponseKeys.PictureFeildValue];
					const picture_description: string = res[ODataResponseKeys.PictureField]==null?'':res[ODataResponseKeys.PictureField][ODataResponseKeys.PictureFieldDescription];
					const etag: string = JSON.parse(res[ODataResponseKeys.OdataEtag]);	
					
			        listItem.PictureId = res[ODataResponseKeys.PictureId];
					listItem.FullName = FullName;
					listItem.Email = EMail;
					listItem.CellPhone = CellPhone;
					listItem.Id =parseInt(ID);
					listItem.WorkAddress = WorkAddress;
					listItem.Picture.Description = picture_description;
					listItem.Website.Description = website_description;
					listItem.Picture.Url = picture_url;
					listItem.Website.Url = website_url;
					listItem.Email = EMail;
					listItem.Etag = parseInt(etag);
					listItemArray.push(listItem);
				});
				return listItemArray;
			});
					
	}
}
