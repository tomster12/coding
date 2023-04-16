
export type GameObject = {
  name: string,
}

export type Location = {
  objects?: GameObject[]
} & GameObject;

export type Item = {
  owner: string
} & GameObject;

export type Enemy = {
  health: number
} & GameObject;