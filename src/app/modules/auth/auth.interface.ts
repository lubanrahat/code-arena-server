export interface IAuthRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IAuthLogin {
  email: string;
  password: string;
}