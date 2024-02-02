
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  UserID,
  UserAuth,
  Player,
  Realm,
  RegisterResponse,
  User,
  Entity,
  Location
} from "./types/globalTypes";

const server = new Server(3000);
console.log("Listening on *:3000");

server.sockets.on("connection", (socket) => {
  console.log(`Connected ${socket.id}`);

  socket.on("requestLogin", (data: UserAuth, callback) => {
    console.log(`Login request for '${data.userID}'`);
    callback(UNIVERSE.checkValidUser(data));
  });

  socket.on("requestRegister", (data: string, callback) => {
    console.log(`Register request for '${data}'`);
    callback(UNIVERSE.generateAndRegisterNewUser(data));
  });

  socket.on("getRealm", (data: UserAuth, callback) => {
    callback(UNIVERSE.getRealm(data.userID));
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected ${socket.id}`);
  });
});

function generateUserUUID() { return uuidv4(); }
function generateEntityUUID() { return uuidv4(); }

class Universe {

  entities: { [key: string]: Entity } = { } // TODO
  users: { [key: UserID]: User } = { }
  realms: { [key: UserID]: Realm } = { }

  static GLOBAL_REALM: Realm = newRealm();


  newUser(userID: UserID): User {
    const token = generateUserUUID();
    const auth: UserAuth = { userID, token };
    const player: Player = this.newPlayer(userID);
    const user: User = { auth, player };
    return user;
  }
  
  newPlayer(userID: UserID): Player {
    return {
      uuid: generateEntityUUID(),
      parent: undefined, // TODO
      name: userID,
      items: []
    };
  }
  
  newRealm(): Realm {
    return {
      uuid: generateEntityUUID(),
      parent: undefined, // TODO
      name: "Void",
      owner: undefined,
      children: []
    }
  }


  checkValidUser(userAuth: UserAuth): boolean {
    let foundUser: User = this.users[userAuth.userID];
    if (foundUser == null) return false;
    return foundUser.auth.token == userAuth.token;
  }

  generateAndRegisterNewUser(userID: UserID): RegisterResponse {
    if (this.users[userID] != undefined) return { accepted: false, reason: "Username already taken" };
  
    const user = this.newUser(userID);
    this.parentEntity(user.player, Universe.GLOBAL_REALM);
  
    console.log(`Registered new user '${userID}'`);
    this.users[user.auth.userID] = user;
    return { accepted: true, userAuth: user.auth }
  }

  parentEntity(child: Entity, parent: Location) {
    // const index = parent.children.indexOf(child);
    // parent.children = parent.children.splice(index, 1);
    parent.children.push(child);
  }

  getRealm(userID: UserID): Realm { return Universe.GLOBAL_REALM; }
}

const UNIVERSE = new Universe();
