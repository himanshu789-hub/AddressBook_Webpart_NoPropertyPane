export class ListItem 
{
    ID: number;
    ContentTypeId: { StringValue: string; };
    Title: string;
    UniqueId: string;
    __metadata: {
        type: string;
        etag: string;
    };
    FullName: string;
    EMail: string;
    CellPhone: string;
    URL: {
        __metadata: {
            type: string;
        };
        Description: string;
        Url: string;
    };
    DisplayTemplateJSIconUrl: {
        __metadata: {
            type: string;
        };
        Description: string;
        Url: string;
    };
    WorkAddress: string;
    PictureIdId: string;
    constructor() {
        this.__metadata.type = "SP.Data.Address_x0020_BookListItem";
        this.URL.__metadata.type = "SP.FieldUrlValue";
        this.DisplayTemplateJSIconUrl.__metadata.type = "SP.FieldUrlValue";
    }
}