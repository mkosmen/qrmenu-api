import { ObjectId } from 'mongodb';

export interface ILogin {
  email: string;
  password: string;
}

export interface User {
  _id?: ObjectId;
  name: string;
  surname: string;
  email: string;
  password?: string;
}

export interface Company {
  _id?: ObjectId;
  name: string;
  slug: string;
  userId: ObjectId;
}

export interface Category {
  _id?: ObjectId;
  name: string;
  slug: string;
  userId: ObjectId;
  active: boolean;
}
