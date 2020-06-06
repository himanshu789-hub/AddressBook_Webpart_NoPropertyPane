import { Container} from 'react-inversify';
import { IAddressBookService } from '../interfaces/IAddressBookService';
import { AddressBookService } from './../service/AddressBookService';
import { IPictureService } from '../interfaces/IPictureService';
import { PictureServiceName } from '../constants/injection';
import { PictureService } from './../service/PictureService';
export let container = new Container();
container.bind<IAddressBookService>("AddressBookService").to(AddressBookService);
container.bind<IPictureService>(PictureServiceName).to(PictureService);