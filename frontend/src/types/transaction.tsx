export interface ITransaction {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    value: number;
    category: string;
    receiver: boolean;
}
