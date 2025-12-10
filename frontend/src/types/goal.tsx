export interface IGoal {
    _id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    requiredValue: number;
    completed: boolean;
}
