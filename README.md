# react-with-socket

A higher order component to manage socket communication in React.

[Check out the live chat example](http://13.59.189.58/) and [its source code](https://github.com/LFDM/react-with-socket/tree/master/examples/chat).

## Motivation

`react-with-socket` allows to separate handling of sockets and your UI.
Its higher order component allows you to declare your handling of
incoming events and to define actions, which are pure javascript
functions which will send data over the socket.

Your presentational components can thus remain socket-agnostic and only need
to deal with incoming props.

`react-with-socket` is not bound to a specific socket implementation.
It integrates best with [socket.io](http://socket.io/) - check the [API
documentation](#configuration) for more.


## Basic Example

```javascript
import io from 'socket.io-client';
import withSocket, { setSocketConstructor } from 'react-with-socket';

setSocketConstructor(io) // define socket.io as our socket provider

const App = withSocket({
  initialState: {
    messages: []
  },
  mapData: () => ({
    // listen to message events and append the incoming message to our list of messages
    message: (props, message) => ({
      messages: [...props.messages, message ]
    })
  }),
  mapEmit: (emit) => ({
    // define an action creator to send data through the socket
    sendMessage: (message) => emit('message', message)
  })
})(({ messages, sendMessage })) => {
  return (
    <div>
      <ul>
        {
          messages.map((message, i) => (
            <li key={i}>{ message }</li>
          ))
        }
      </ul>
      <button onClick={ () => sendMessage('Some text!')}>Send a message!</button>
    </div>
  );
}
```



## API Documentation


### HOC

#### withSocket(config) => ((Component) => Component)


### Configuration

#### setSocketConstructor((props) => Socket): void

Sets the default socket constructor function, which is used on
`componentWillMount`, when the `createSocket` option is not specified.

A `Socket` needs to be of the following shape:

```
{
  on: ((event: String, data: Object) => void) => void
  emit: (event: String, data: Object) => void
  close: () => void
}
```
`on` listens to incoming data, identified by an event name.

`emit` sends data through the socket, identified by an event name. The
data object needs to be serializable.

`close` is called when the component unmounts and should close the
socket connection.

This is a subset of a `Socket` as defined by [socket.io](https://socket.io/docs/client-api/#socket).


------------------------------------------------

Brought to you by [Team Outlaw](https://www.small-improvements.com/company/team-outlaw/) @ [Small Improvements](https://www.small-improvements.com)
