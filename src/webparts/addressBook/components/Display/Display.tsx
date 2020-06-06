import * as React from 'react';
import { Redirect,withRouter } from 'react-router-dom';
import Edit from './../../assets/edit.jpg';
import Delete from '../../assets/delete.png';
import { IAddressItem } from '../../interfaces/IAddressItem';
import { injectable, inject, connect } from 'react-inversify';
import { IAddressBookService } from '../../interfaces/IAddressBookService';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { AddressItem } from '../../models/AddressItem';
import { handleError } from '../../exception/exception';
import { componentDisplay, errorClass, remove, removeFinalDescription } from '../../constants/constants';
import styles from '../AddressBook.module.scss';
import { PictureServiceName } from '../../constants/injection';
import { IPictureService } from '../../interfaces/IPictureService';

interface ITableProps {
	contact: IAddressItem;
	history: any;
}

export class Table extends React.Component<ITableProps, {}> {
	render() {
		const { contact } = this.props;
		return (
			<div className={styles.infoTable}>
				<table>
					<tbody>
						<tr>
							<td colSpan={2} className={styles.fixedName}>{this.props.contact.FullName||''}</td>
							<td><p className={styles.fixedImage}><img src={this.props.contact.Picture.Url||''}/></p></td>
						</tr>
						<tr>
							<td className={styles.fixedField}>Email</td>
							<td>:</td>
							<td>{this.props.contact.Email||''}</td>
						</tr>
						<tr>
							<td className={styles.fixedField}>Mobile</td>
							<td>:</td>
							<td>{this.props.contact.CellPhone||''}</td>
						</tr>
						<tr>
							<td className={styles.fixedField}>Website</td>
							<td>:</td>
							<td>{this.props.contact.Website.Url}</td>
						</tr>
						<tr>
							<td rowSpan={4} className={styles.fixedField}>Address</td>
							<td rowSpan={4}>:</td>
							<td rowSpan={4}>{this.props.contact.WorkAddress}</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}

interface IDisplayDependenciesProps {
	AddressBookService: IAddressBookService;
	PictureService: IPictureService;
}
@injectable()
class Dependencies {
	@inject('AddressBookService') public readonly AddressBookService: IAddressBookService;
	@inject(PictureServiceName) public readonly PictureService: IPictureService;
}

interface IDisplayProps {
	history: any;
	match: any;
	siteUrl: string;
	spHttpClient: SPHttpClient;
	setStatus: Function;
	IsStateSetFromGetByDisplay: boolean;
}

interface IDisplayState {
	contact: IAddressItem;
}

class Display extends React.Component<IDisplayProps & IDisplayDependenciesProps, IDisplayState> {
	constructor(props) {
		super(props);
		this.state = {
			contact: new AddressItem(),
		};
	}
	componentDidMount() {
		const { match, AddressBookService, spHttpClient, siteUrl,setStatus,IsStateSetFromGetByDisplay } = this.props;
		const { params } = match;
		const { id } = params;

		AddressBookService.GetById(id, spHttpClient, siteUrl)
			.then((res:IAddressItem) => {
				this.setState({
					contact: res ,
				});
			})
			.catch(err => {
				if (!IsStateSetFromGetByDisplay)
					handleError(err, setStatus, componentDisplay);
			});
	}
	componentWillReceiveProps(nextProps) {
		const {  AddressBookService,IsStateSetFromGetByDisplay, spHttpClient,setStatus, siteUrl } = this.props;
		const { match } = nextProps;
		const { params } = match;
		const { id } = params;
	 AddressBookService.GetById(id, spHttpClient, siteUrl)
			.then((res:IAddressItem) => {
				this.setState({
					contact: res 
				});
			})
			.catch(err => {
				if (!IsStateSetFromGetByDisplay)
					handleError(err, setStatus, componentDisplay);
			});
	}
	onEditClick() {
		const { match, history } = this.props;
		const { params } = match;
		const { id } = params;
		const str: String = '/edit/' + id.toString();
		history.push(str);
	}
async	onDeleteClick() {
		const { match, AddressBookService,PictureService, spHttpClient, history, siteUrl,setStatus } = this.props;
		const { params } = match;
		const { id } = params;
	const { contact } = this.state;
	try{
		const response: boolean = await PictureService.Delete(contact.PictureId, spHttpClient, siteUrl);
		debugger;
		if (!response) {
			handleError(new Error('Unexpected Error : Cannot Delete Profile Picture . . .'), setStatus);
			return;
		}
	} catch (err) {
		handleError(err, setStatus);
		return;
	}
		AddressBookService.Delete(contact.Etag, Number(id), spHttpClient, siteUrl)
			.then((res) => {
				if (res) {
					setStatus(remove, removeFinalDescription);
					history.push('/');
					
				}
				else
					setStatus(errorClass, "Item Cannot Be Deleted . . .");
			})
			.catch(error => {
				handleError(error, setStatus);
			});
	}
	render() {
		const { contact } = this.state;
		return ( <div className={styles.displayContainer}>
				<div id='showDetail'>
					<Table contact={contact} {...this.props}></Table>
					
						<div className={styles.editSection}>
							<img src={Edit} alt='edit' />
							<button id='EditButton' value='Edit' onClick={this.onEditClick.bind(this)}>
								EDIT
							</button>
						</div>
						<div className={styles.deleteSection}>
							<img src={Delete} />
							<button id='DeleteButton' value='Delete' onClick={this.onDeleteClick.bind(this)}>
								DELETE
							</button>
						</div>
					</div>
				</div>
			
		);
	}
	
}

export default connect(Dependencies, (deps, ownProps: IDisplayProps) => ({
	AddressBookService: deps.AddressBookService,
	spHttpClient: ownProps.spHttpClient,
	PictureService: deps.PictureService,
	siteUrl: ownProps.siteUrl,
	setStatus:ownProps.setStatus
}))(withRouter(Display));
