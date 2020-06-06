import * as React from 'react';
import { IAddressItem } from '../../interfaces/IAddressItem';
import { AddressItem } from '../../models/AddressItem';
import { IAddressBookService } from './../../interfaces/IAddressBookService';
import { injectable, inject, connect } from 'react-inversify';
import { SPHttpClient } from '@microsoft/sp-http';
import { withRouter } from 'react-router-dom';
import {
	EmailExp,
	MobileExp,
	NameExp,
	WebsiteExp,
} from './../regular expressions/regularExpressionConstants';
import { handleError } from './../../exception/exception';
import Cleave from 'cleave.js/react';
import { IPictureService } from '../../interfaces/IPictureService';
import { PictureServiceName } from '../../constants/injection';
import {
	create,
	createFinalDescription,
	updateFinalDescription,
	redentionId,
	componentForm,
	updateValue,
	errorClass
} from '../../constants/constants';
import Loading from './../../assets/35.gif';
import {v4} from 'uuid';
import styles from '../AddressBook.module.scss';
import * as appSettings from 'AppSettings';
interface IFormDependenciesProps {
	AddressBookService: IAddressBookService;
	PictureService: IPictureService;
}

@injectable()
class Dependencies {
	@inject('AddressBookService') public readonly AddressBookService: IAddressBookService;
	@inject(PictureServiceName) public readonly PictureService: IPictureService;
}

interface IFormState {
	isNameValid: boolean;
	isEmailIdValid: boolean;
	isWebsiteValid: boolean;
	isLandLineValid: boolean;
	isMobileValid: boolean;
	shouldValid: boolean;
	contact?: IAddressItem;
	isNameAlreadyExists: boolean;
	isOnUpdate?: boolean;
	src: string;
	isImageUploaded: boolean;
	isImageSelected: boolean;
	ImageFile: ArrayBuffer;
	ImageMsg: string;
	ImageName: string;
	shouldDisplayUpload: boolean;
	showLoading: boolean;
}
interface IFormProps {
	history: any;
	siteUrl: string;
	match: any;
	setStatus: Function;
	spHttpClient: SPHttpClient;
	IsStateSetFromGetByForm: boolean;
}

class Form extends React.Component<IFormProps & IFormDependenciesProps, IFormState> {
	constructor(props) {
		super(props);

		this.state = {
			isNameValid: false,
			isWebsiteValid: false,
			isEmailIdValid: false,
			isLandLineValid: true,
			isMobileValid: false,
			shouldValid: false,
			isNameAlreadyExists: false,
			contact: new AddressItem(),
			isOnUpdate: false,
			src: '',
			ImageName: null,
			isImageSelected: false,
			isImageUploaded: false,
			ImageFile: null,
			ImageMsg: '',
			showLoading:false,
			shouldDisplayUpload: false,
		};
		this.onFileSelect = this.onFileSelect.bind(this);
		this.onFileUpload = this.onFileUpload.bind(this);
		
	}
	componentDidMount() {
		const { match, AddressBookService, setStatus, spHttpClient, siteUrl } = this.props;
		const { params } = match;
		const { id } = params;
		if (id != undefined) {
			AddressBookService.GetById(parseInt(id), spHttpClient, siteUrl)
				.then((res) => {
					this.setState({
						contact: { ...res },
						isOnUpdate: true,
						src: res.Picture.Url + '?RenditionID=' + redentionId,
					});
				})
				.catch((error) => {

					handleError(error,setStatus,componentForm);
				});
		}
	}

	onFileSelect(event) {
		const { target } = event;
		const { files } = target;
		debugger;
		let fileReader = new FileReader();
		this.setState({ ImageFile: files[0], ImageName: files[0].name });
		fileReader.onloadend = () => {
			this.setState({ src: fileReader.result + '', isImageSelected: true, shouldDisplayUpload: true });
		};
		fileReader.readAsDataURL(files[0]);
	}
	async onFileUpload() {
		const { isImageSelected, ImageFile, ImageName,showLoading } = this.state;
		const { PictureService, spHttpClient, siteUrl,setStatus } = this.props;

		if (!isImageSelected) {
			this.setState({ ImageMsg: 'Please Select a Image First . . .' });
			return;
		}
		this.setState({ showLoading: true });
		if (confirm('Are You Sure To Upload Current Image . . .') == true) {
			let fileName: string = null;
			debugger;
			const { isOnUpdate, contact } = this.state;
			if (isOnUpdate) {
				try {
					const response: string = await PictureService.GetNameById(contact.PictureId, spHttpClient);
					fileName = response;
				}
				catch (err) {
					handleError(err, setStatus);
					return;
				}
			}
			else {
				debugger;
				fileName = v4()+ImageName.substring(ImageName.lastIndexOf('.'));
			}
			this.setState({ ImageName: fileName });
			PictureService.Upload(spHttpClient, siteUrl, ImageFile, fileName).then((res) => {
				debugger;
				this.setState((prevState) => {
					return {
						contact: {
							...prevState.contact,
							Picture: { ...prevState.contact.Picture, Url: res.ImageUri + '?RenditionID=' + redentionId },
						    PictureId:res.Id
						},
						isImageUploaded: true,
						shouldDisplayUpload: false,
						showLoading:false
					};
				});
			}).catch(err => {
				handleError(err, setStatus);
			});
		} else {
			this.setState({
				ImageFile: null,
				ImageMsg: '',
				src: '',
				isImageSelected: false,
			});
		}
	}
	render() {
		const { shouldDisplayUpload, src,showLoading } = this.state;
		return (
			<div className={styles.formContainer}>
				<div className={styles.formContent}>
						<div className={styles.name}>
							<p>
								Name
								<span className={styles.incorrect}>
									*
									{this.state.isNameAlreadyExists
										? 'Name Already Exists'
										: !this.state.shouldValid
										? ''
										: !this.state.isNameValid
										? '#Incorrect'
										: ''}
								</span>
							</p>
							<input
								name='FullName'
								placeholder='Abc Xyz'
								type='text'
								value={this.state.contact.FullName}
								onChange={this.onChangeEvent.bind(this)}
							/>
						</div>
						<div className={styles.email}>
							<p>
								Email
								<span className={styles.incorrect}>
									*{this.state.shouldValid ? (!this.state.isEmailIdValid ? '#InCorrect' : '') : ''}
								</span>
							</p>
							<input
								name='Email'
								placeholder='demo@doom.com | demo@doom.co.in'
								type='text'
								value={this.state.contact.Email}
								onChange={this.onChangeEvent.bind(this)}
							/>
						</div>
							<div className={styles.mobile}>
								<p>
									Mobile
									<span className={styles.incorrect}>
										*{this.state.shouldValid ? (!this.state.isMobileValid ? '#InCorrect' : '') : ''}
									</span>
								</p>
								<Cleave
									placeholder='+XX XXXXX XXXXX'
									name='CellPhone'
									type='text'
									value={this.state.contact.CellPhone}
									onChange={this.onChangeEvent.bind(this)}
									options={{
										blocks: [3, 5, 5],
										delimiter: ' ',
										numericOnly: false,
										delimiterLazyShow: true,
									}}
								/>
							</div>
						<div className={styles.website}>
							<p>
								Website
								<span className={styles.incorrect}>
									*{this.state.shouldValid ? (!this.state.isWebsiteValid ? '#InCorrect' : '') : ''}
								</span>
							</p>
							<Cleave
								name='Website'
								options={{
									prefix: 'https://www.',
								}}
								type='text'
								value={this.state.contact.Website.Url}
								onChange={this.onChangeEvent.bind(this)}
							/>
						</div>
						<div className={styles.address}>
							<p>Address</p>
							<textarea
								name='WorkAddress'
								placeholder='47 Paris Hill Drive
								Dallas, TX 75214'
								value={this.state.contact.WorkAddress}
								onChange={this.onChangeEvent.bind(this)}
							></textarea>
						</div>
					</div>
				<div className={styles.profileContainer}>
					<div className={styles.profileContent}>
						<div className={styles.profileImage}><img src={src} /></div>
						<div  className={styles.fileSelectorButton}><label htmlFor="fileSelect">Browse Image</label><input  type='file' id='fileSelect' onInput={this.onFileSelect} /></div>
					
					</div>
					<div className={styles.uploadArea}>
						<label htmlFor="UploadButton">Upload</label>
						<span className={showLoading?styles.showLoading:styles.noLoading}><img src={Loading} /></span>
						<input
							type='button'
						id='UploadButton'
							name='upload'
							value='Upload'
							disabled={!shouldDisplayUpload}
							onClick={this.onFileUpload}
						/>
					</div>
				</div>
					<div className={styles.event}>
						<button
							id='AddButton'
							name='add'
							style={{ display: this.state.isOnUpdate ? 'none' : 'block' }}
							onClick={this.onButtonclick.bind(this)}
						>
							Add
						</button>
						<div style={{ display: this.state.isOnUpdate ? 'block' : 'none' }} className={styles.updateContainer}>
							<button id='UpdateButton' name='update' onClick={this.onButtonclick.bind(this)}>
							Update
							</button>
							
						<button id='CancelButton' name='cancel' onClick={this.onButtonclick.bind(this)}>
								Cancel
							</button>
						</div>
					
				</div>
			</div>
		);
	}
	onChangeEvent=(event) => {
		const nam: string = event.target.name;
		const val: string = event.target.value;

		if (nam == 'Email' || nam == 'FullName' || nam == 'CellPhone' || nam == 'WorkAddress')
			this.setState((prevState) => {
				return { contact: { ...prevState.contact, [nam]: val } };
			});

		if (nam == 'Email') {
			if (this.state.shouldValid && EmailExp.test(val)) {
				this.setState({ isEmailIdValid: true });
			} else this.setState({ isEmailIdValid: false });
		}
		if (nam == 'FullName') {
			if (this.state.shouldValid && NameExp.test(val)) {
				this.setState({ isNameValid: true });
			} else this.setState({ isNameValid: false });
		}
		if (nam == 'Website') {
			this.setState((prevState) => {
				return {
					contact: { ...prevState.contact, Website: { ...prevState.contact.Website, Url: val } },
				};
			});
			if (this.state.shouldValid && WebsiteExp.test(val)) {
				this.setState({ isWebsiteValid: true });
			} else this.setState({ isWebsiteValid: false });
		}
		if (nam == 'CellPhone') {
			if (this.state.shouldValid && MobileExp.test(val)) {
				this.setState({ isMobileValid: true });
			} else this.setState({ isMobileValid: false });
		}
	}
	 
	onButtonclick = async (event: React.MouseEvent<HTMLButtonElement>) => {
		
		const { contact } = this.state;
		const { AddressBookService, spHttpClient, siteUrl, history} = this.props;
		 const {currentTarget:{name} } = event;
		 if (event.currentTarget.name == 'cancel') {
			history.replace('/' + this.state.contact.Id);
		}
await AddressBookService.GetAll(spHttpClient, siteUrl).then((res: Array<IAddressItem>) => {
		let flag: boolean = false;
		const { isOnUpdate } = this.state;
				if (isOnUpdate) {
					for (var i = 0; i < res.length; i++) {
						if (res[i].Id == contact.Id) continue;
						if (res[i].FullName == contact.FullName) {
							flag = true;
							break;
						}
					}
				} else {
					for (var j = 0; j < res.length; j++) {
						if (res[j].FullName == contact.FullName) {
							flag = true;
							break;
						}
					}
				}
				if (flag) {
					this.setState({ isNameAlreadyExists: true });
					return;
				} else this.setState({ isNameAlreadyExists: false });
				this.setState({ shouldValid: true });
			})
		.catch(err => {
			   const { setStatus } = this.props;
				handleError(err, setStatus);
		});
		 
		 if (!this.IsValid(contact))
			 return;
		contact.Picture.Description = contact.FullName + "'s Image";
		if (name == 'add') {
			AddressBookService.Create(contact, spHttpClient, siteUrl).then((response: IAddressItem):void => {
						const { setStatus,history:siteHistory } = this.props;
						setStatus(create, createFinalDescription);
						siteHistory.push('/' + response.Id.toString());
					})
					.catch(err => {
						const { setStatus } = this.props;
						handleError(err,setStatus);
					});
		} else if (name == 'update') {
			
				contact.Id = this.state.contact.Id;
				AddressBookService.Update(contact, spHttpClient, siteUrl).then((response:IAddressItem):void=> {
						const { setStatus,history:siteHistory } = this.props;
						setStatus(updateValue, updateFinalDescription);
						siteHistory.push('/' + response.Id.toString());
					})
					.catch(err => {
						const { setStatus } = this.props;
						handleError(err, setStatus);
					});
			}
	}
	IsValid(contact: IAddressItem): boolean {
		let isNameValid: boolean;
		let isEmailValid: boolean;
		let isWebsiteValid: boolean;
		let isLandLineValid: boolean;
		let isMobileValid: boolean;
		let isAllValid: boolean;
		isAllValid = false;
		isLandLineValid = true;
		isNameValid = NameExp.test(this.state.contact.FullName);
		isEmailValid = EmailExp.test(this.state.contact.Email);
		isWebsiteValid = WebsiteExp.test(this.state.contact.Website.Url);
		isMobileValid = MobileExp.test(this.state.contact.CellPhone);

		if (isNameValid && isEmailValid && isWebsiteValid && isMobileValid) isAllValid = true;
		var result = {
			isAllValid: isAllValid,
			name: isNameValid,
			email: isEmailValid,
			website: isWebsiteValid,
			landline: isLandLineValid,
			mobile: isMobileValid,
		};

		if (!result.isAllValid) {
			if (result.name) this.setState({ isNameValid: true });
			else this.setState({ isNameValid: false });

			if (result.website) this.setState({ isWebsiteValid: true });
			else this.setState({ isWebsiteValid: false });

			if (result.mobile) this.setState({ isMobileValid: true });
			else this.setState({ isMobileValid: false });

			if (result.email) this.setState({ isEmailIdValid: true });
			else this.setState({ isEmailIdValid: false });

			return false;
		}
		return true;
	}
}

export default connect(Dependencies, (deps, ownProps: IFormProps) => ({
	AddressBookService: deps.AddressBookService,
	PictureService: deps.PictureService,
	spHttpClient: ownProps.spHttpClient,
	siteUrl: ownProps.siteUrl,
	setStatus: ownProps.setStatus,
}))(withRouter(Form));
