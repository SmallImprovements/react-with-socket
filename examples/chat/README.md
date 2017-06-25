
# Socket.IO Chat -> using react-with-socket

This is the same chat demo as [here](https://github.com/socketio/socket.io/tree/master/examples/chat), just replacing the frontend with a React version using the library provided in this repository.

[Click here](http://13.59.189.58) to join a live version of it.

## How to use locally

```
$ npm install
$ npm start
$ npm run start:dev
```

This runs the express backend server and a webpack dev server for the
frontend bit.

And point your browser to [http://localhost:8080](http://localhost:8080).

You can alternatively run the application within a Docker container as
well.

## Features (same as the original socket.io example)

- Multiple users can join a chat room by each entering a unique username
on website load.
- Users can type chat messages to the chat room.
- A notification is sent to all users when a user joins or leaves
the chatroom.
