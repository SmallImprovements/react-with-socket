import { Component, createElement } from 'react';
import hoistStatics from 'hoist-non-react-statics';

const config = {
  base: '',
  constructor: () => { throw new Error('No constructor defined'); }
};

export const setSocketBase = (base) => { config.base = base; };
export const setSocketConstructor = (constructor) => { config.constructor = constructor; };
export const setSocketConfig = (nextConfig) => Object.assign(config, nextConfig);

const standardSocket = (url) => () => config.constructor(`${config.base}/${url}`);
const emptyMap = () => ({});
const emptyActions = (emit) => ({ emit });

const withSocket = (
  createListeners = emptyMap,
  createActions = emptyActions,
  createCallbacks = emptyMap,
  createSocket = standardSocket('')
) => (component) => {
  class SocketWrapper extends Component {
    constructor(props) {
      super(props);
      this.state = { props: {} };
    }

    componentWillMount() {
      this.socket = createSocket();
      const listeners = createListeners(this.props);
      const callbacks = createCallbacks();

      Object.keys(listeners).forEach((event) => {
        this.socket.on(event, (data) => {
          const updater = (prevState) => {
            const nextProps = listeners[event](data, { ...this.props, ...prevState.props });
            return {
              ...prevState.state,
              props: {
                ...prevState.props,
                ...nextProps
              }
            };
          };

          const onUpdate = () => {
            const callback = callbacks[event];
            if (callback) {
              callback(data, this.state.props);
            }
          };

          this.setState(updater, onUpdate);
        });
      });
    }

    componentWillUnmount() {
      this.socket.close();
    }

    render() {
      const emit = (...args) => { this.socket.emit(...args); };
      const nextProps = { ...this.props, ...this.state.props };
      return createElement(component, { ...nextProps, ...createActions(emit, nextProps) });
    }
  }

  return hoistStatics(SocketWrapper, component);
};

export default withSocket;
