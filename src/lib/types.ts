export interface ILogin {
  email: string;
  password: string;
}

export interface User {
  _id?: string;
  name: string;
  surname: string;
  email: string;
  password?: string;
}
