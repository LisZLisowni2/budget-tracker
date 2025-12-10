export interface IUser {
    username: string;
    email: string;
    password?: string;
    scope?: string;
    phone?: string;
    baseCurrency?: string;
    isVerifed: boolean;
    _id?: string;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    preferredLanguage?: string;
}
