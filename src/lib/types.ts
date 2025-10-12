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

export interface Product {
  _id?: ObjectId;
  name: string;
  categoryId: ObjectId;
  slug: string;
  userId: ObjectId;
  active: boolean;
}

export enum DiscountEnum {
  COMMON = 'common',
  PRODUCT = 'product',
}
export interface Discount {
  _id?: ObjectId;
  userId: ObjectId;
  code?: string;
  percentage?: number;
  price?: number;
  min_basket_price?: number;
  discount_type: DiscountEnum;
  materialId?: ObjectId;
  started_at: Date;
  finished_at: Date;
  active?: boolean;
}
