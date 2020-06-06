import { IAddressItem } from '../interfaces/IAddressItem';
import { IURLField } from "../interfaces/IURLField";
import { URLField } from './URLField';
import { IPictureInfo } from '../interfaces/IPictureInfo';
import { PictureInfo } from './PictureInfo';
export class AddressItem implements IAddressItem
{
  public Id: number;
  public  FullName: string;
  public  Email: string;
  public  CellPhone: string;
  public Picture: IURLField;
  public PictureId: number;
  public  WorkAddress: string;
  public  Website: IURLField;
  public  constructor()
    {
        this.Id = 0;
        this.CellPhone = '';
        this.Email = '';
        this.FullName = '';
        this.Picture = {Description:'',Url:''};
        this.Website = new URLField();
    }
  Etag: number;
}