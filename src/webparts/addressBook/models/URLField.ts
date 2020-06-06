
import { IURLField } from "../interfaces/IURLField";

export class URLField implements IURLField
{
    public Description: string;
    public Url: string;
    constructor() {
        this.Description = '';
        this.Url = '';
    }
}