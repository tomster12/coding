
// --- Communication

export type UserID = string;

export type UserDetails = {
  username: string
  userID: UserID
}

export type UserState = {
} & UserDetails

export type RegisterResponse = {
  accepted: boolean
  userDetails?: UserDetails
  reason?: string
}

// --- Game

export type Entity = {
  name: string,
}

export type Location = {
  objects?: Entity[]
} & Entity;

export type Realm = {
  owner: UserID
} & Location;

export type Item = {
  owner?: UserID
  value: number
  weight: number
  count: number
} & Entity;

export type Enemy = {
  health: number
} & Entity;
