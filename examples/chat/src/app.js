import { Component } from 'react';
import io from 'socket.io-client';
import withSocket, { setSocketConfig } from '../../../src';
import EmptyFormInput from './components/EmptyFormInput';
import ChatInput from './components/ChatInput';
import { noop, omit, getColorByString } from './util';

import './style.css';

setSocketConfig({
  constructor: io
});


const toLogMsg = (message) => ({
  type: 'log',
  message
});
const toMsg = (username, message) => ({
  type: 'message',
  username,
  message,
  color: getColorByString(username)
});

const initialState = {
  connected: false,
  username: '',
  messages: [],
  typingUsers: {},
  numUsers: 0
};

const mapData = () => ({
  'new message': ({ username, message }, { messages }) => ({
    messages: [...messages, toMsg(username, message)]
  }),
  'login': ({ username, numUsers }, { messages }) => ({
    connected: true,
    username,
    numUsers,
    messages: [...messages, toLogMsg('Welcome to this demo!')]
  }),
  'user joined': ({ username, numUsers }, { messages }) => ({
    messages: [...messages, toLogMsg(`${username} joined`)],
    numUsers
  }),
  'user left': ({ username, numUsers }, { messages, typingUsers }) => ({
    messages: [...messages, toLogMsg(`${username} left`)],
    numUsers,
    typingUsers: omit(username, typingUsers)
  }),
  'typing': ({ username }, { typingUsers }) => ({
    typingUsers: { ...typingUsers, [username]: true }
  }),
  'stop typing': ({ username }, { typingUsers }) => ({
    typingUsers: omit(username, typingUsers)
  }),
  'disconnect': (_, { messages }) => ({
    connected: false,
    messages: [...messages, toLogMsg(`you have been disconnected`)]
  }),
  'reconnect': (_, { messages }) => ({
    connected: true,
    messages: [...messages, toLogMsg('you have been reconnected')]
  }),
  'reconnect_error': (_, { messages }) => ({
    messages: [...messages, toLogMsg('attempt to reconnect has failed')]
  })
});

const callbacks = () => ({
  reconnect: (_, { actions, username }) => { if (username) { actions.login(username); } }
});

const mapEmit = (emit, props) => ({
  actions: {
    login: (username) => emit('add user', username),
    sendMessage: (message) => {
      emit('new message', message);
      props.updateProps({
        messages: [...props.messages, toMsg(props.username, message) ]
      });
    },
    type: (isTyping) => emit(isTyping ? 'typing' : 'stop typing')
  }
});

export default withSocket({
  initialState,
  mapData,
  mapEmit,
  callbacks
})(({
  username,
  messages,
  typingUsers,
  numUsers,
  actions: { login, sendMessage, type },
}) => {
  return username ?
    <Chat messages={ messages } numUsers={numUsers} typingUsers={ typingUsers } onType={type} onSend={sendMessage} /> :
    <Login onSubmit={ login } />
});

function Login({ onSubmit }) {
  return (
    <div className="login page">
      <div className="form">
        <h3 className="title">{ `What's your nickname?` }</h3>
        <EmptyFormInput inputClassName="usernameInput" onSubmit={onSubmit} />
      </div>
    </div>
  );
}

function Chat({ messages, typingUsers, numUsers, onType, onSend }) {
  return (
    <div>
      <div className="chatArea">
        <Messages messages={ messages } />
      </div>
      <Status typingUsers={ Object.keys(typingUsers) } numUsers={numUsers} />
      <ChatInput
        inputClassName="inputMessage"
        placeholder="Type here..."
        onSubmit={onSend}
        onType={onType}
      />
    </div>
  );
}

function Messages({ messages }) {
  return (
    <ul className="messages">
      { messages.map(({ type, username, message, color }, i) => {
        if (type === 'log') {
          return <li className="log" key={i}>{message}</li>;
        }
        return <li key={i}><Username name={username} color={color}/>{message}</li>;
      })}
    </ul>
  );
}

function Username({ name, color }) {
  return <span className="username" style={{ color }}>{ name }</span>;
}

function Status({ typingUsers, numUsers }) {
  const getTypingText = () => {
    const count = typingUsers.length;
    if (!count) { return ''; }
    if (count === 1) { return `${typingUsers[0]} is typing`; }
    if (count < 4) { return `${typingUsers.join(', ')} are typing}`; }
    return `${count} users are typing`;
  }
  const participants = `${numUsers} participant${numUsers === 1 ? '' : 's'}`
  const typing = getTypingText();
  return (
    <div className="status">
      { typing } { typing ? '-' : '' } { participants }
    </div>
  );
}

