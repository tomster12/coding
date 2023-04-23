
// --- Communication

export type UserID = string;

export type UserAuth = {
  userID: UserID
  token: string
}

export type User = {
  auth: UserAuth
  player: Player
}

export type RegisterResponse = {
  accepted: boolean
  userAuth?: UserAuth
  reason?: string
}

// --- Game

export type Entity = {
  uuid: string
  name: string
}

export type Player = {
  items: Item[]
} & Entity;

export type Location = {
  children: Entity[]
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
