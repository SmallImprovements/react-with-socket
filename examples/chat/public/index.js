import { Component } from 'react';
import withSocket from '../../../src';
import EmptyFormInput from './components/EmptyFormInput';
import ChatInput from './components/ChatInput';
import { noop, omit } from './util';

const TYPING_TIMER_LENGTH = 400;
const COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

const getUsernameColor = () => {
  let hash = 7;
  for (var i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash << 5) - hash;
  }
  return COLORS[Math.abs(hash % COLORS.length)];
};

const toLogMsg = (message) => ({
  type: 'log',
  message
});
const toMsg = (username, message) => ({
  type: 'message',
  username,
  message,
  color: getUsernameColor(username)
});

const initialState = {
  connected: false,
  username: '',
  messages: [],
  typingUsers: {}
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
    messages: [...messages, toLogMsg(`${username} joined`)]
    numUsers,
  }),
  'user left': ({ username, numUsers }, { messages, typingUsers }) => ({
    messages: [...messages, toLogMsg(`${username} left`)]
    numUsers,
    typingUsers: omit(username, typingUsers)
  }),
  'typing': ({ username }, { typingUsers }) => ({
    typingUsers: { ...typingUsers, username: true }
  }),
  'stop typing': ({ username }, { typingUsers }) => ({
    typingUsers: omit(username, typingUsers)
  }),
  'disconnect': (_, { messages }) => ({
    connected: false
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
        messages: [...props.messages, { username: props.username, message }]
      });
    },
    type: (isTyping) => emit(isTyping ? 'typing' : 'stop typing')
  }
});

const ConnectedApp = withSocket({
  initialState,
  mapData,
  mapEmit,
  callbacks
})(({
  username,
  messages,
  typingUsers,
  actions: { login, sendMessage, type },
}) => {
  if (!username) {
    return <Login onSubmit={ actions.login } />
  }
  return <Chat messages={ messages } typingUsers={ typingUsers } onType={type} onSend={sendMessage} />
});

function Login({ onSubmit }) => {
  return (
    <EmptyFormInput onSubmit={onSubmit} />
  );
}

function Chat({ messages, typingUser, onType, onSend }) {
  return (
    <div>
      <Messages messages={ messages } />
      <TypingUsers typingUsers={ Object.keys(typingUsers) } />
      <ChatInput onSubmit={onSend} onType={onType} />
    </div>
  );
}

function Messages({ messages }) {
  return (
    <ul>
      { messages.map(({ type, username, message, color }, i) => {
        if (type === 'log') {
          return <li key={i}>{message}</li>;
        }
        return <li key={i}><span>{username}</span>{message}</li>;
      })}
    </ul>
  );
}

function TypingUsers({ typingUsers }) {
  const getText = () => {
    const count = typingUsers.length;
    if (!count) { return ''; }
    if (count === 1) { return `${typingUsers[0] is typing}`; }
    if (count < 4) { return `${typingUsers.join(', ') are typing}`; }
    return `${count} users are typing`;
  }
  return <div>{ getText() }</div>;
}

