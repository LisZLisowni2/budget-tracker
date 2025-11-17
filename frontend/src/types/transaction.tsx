export interface ITransaction {
    _id: string;
    dateCreation: Date;
    dateUpdate: Date;
    name: string;
    price: number;
    category: string;
    receiver: boolean;
}