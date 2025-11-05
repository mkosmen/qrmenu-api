import { ObjectId } from 'mongodb';

export interface ILogin {
  email: string;
  password: string;
}

export interface ByTimePowered {
  created_at?: Date;
  updated_at?: Date;
}

interface HasObjectId {
  _id?: ObjectId;
}

export interface User extends HasObjectId, ByTimePowered {
  name: string;
  surname: string;
  email: string;
  password?: string;
}

export interface Company extends HasObjectId, ByTimePowered {
  name: string;
  slug: string;
  userId: ObjectId;
}

export interface Category extends HasObjectId, ByTimePowered {
  name: string;
  slug: string;
  userId: ObjectId;
  active: boolean;
}

export interface Product extends HasObjectId, ByTimePowered {
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
export interface Discount extends HasObjectId, ByTimePowered {
  userId: ObjectId;
  code?: string;
  percentage?: number;
  price?: number;
  min_basket_price?: number;
  type: DiscountEnum;
  materialId?: ObjectId;
  started_at?: Date;
  finished_at?: Date;
  active?: boolean;
}
