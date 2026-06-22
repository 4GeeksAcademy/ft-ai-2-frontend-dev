export interface IUser {
  username: string
  password: string
  email: string
}

export interface IDataStore {
  token: string | null
  token_expiry: Date | null
}
