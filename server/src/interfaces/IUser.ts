import { BaseEntity } from './BaseEntity';

export interface IUser extends BaseEntity {
    email: string;
    username: string; // From ERDiagram.md
    passwordHash: string;
}
