
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  UserID,
  UserDetails,
  Realm,
  RegisterResponse
} from "./types/globalTypes";

const server = new Server(3000);
console.log("Listening on *:3000");

server.sockets.on("connection", (socket) => {
  console.log(`Connected ${socket.id}`);

  socket.on("requestLogin", (data: UserDetails, callback) => {
    console.log(`Login request for '${data.username}'`);
    callback(checkValidUser(data));
  });

  socket.on("requestRegister", (data: string, callback) => {
    console.log(`Register request for '${data}'`);
    callback(generateAndRegisterNewUser(data));
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected ${socket.id}`);
  });
});

let takenUsernames: Set<string> = new Set()
let users: { [key: UserID]: UserDetails} = { }
let realms: { [key: UserID]: Realm} = { }

function checkValidUser(userDetails: UserDetails): boolean {
  if (!takenUsernames.has(userDetails.username)) return false;
  let foundUser: UserDetails = users[userDetails.userID];
  if (foundUser == null) return false;
  if (foundUser.username != userDetails.username) return false;
  return true;
}

function generateAndRegisterNewUser(username: string): RegisterResponse {
  if (takenUsernames.has(username)) {
    return {
      accepted: false,
      reason: "Username already taken"
    };
  }
  let newUserDetails: UserDetails = {
    username: username,
    userID: uuidv4()
  };
  takenUsernames.add(username);
  users[newUserDetails.userID] = newUserDetails;
  console.log(`Registered new user '${username}'`);
  return {
    accepted: true,
    userDetails: newUserDetails
  }
}
