import { Component, createElement } from 'react';
import hoistStatics from 'hoist-non-react-statics';

const config = {
  base: '',
  constructor: () => { throw new Error('No constructor defined'); }
};

export const setSocketBase = (base) => { config.base = base; };
export const setSocketConstructor = (constructor) => { config.constructor = constructor; };
export const setSocketConfig = (nextConfig) => Object.assign(config, nextConfig);

export const defaultSocket = (url) => () => config.constructor(`${config.base}/${url}`);

const emptyMap = () => ({});
const emptyActions = (emit) => ({ emit });

const mergeState = (prevState, nextProps) => ({
  ...prevState.state,
  props: {
    ...prevState.props,
    ...nextProps
  }
});

const withSocket = ({
  mapData = emptyMap,
  mapEmit = emptyActions,
  initialState = {},
  callbacks = emptyMap,
  createSocket = defaultSocket(''),
  keepAlive = false
} = {}) => (component) => {
  class SocketWrapper extends Component {
    constructor(props) {
      super(props);
      this.state = { props: initialState };
    }

    update(nextProps) {
      this.setState(prevState => mergeState(prevState, nextProps));
    }

    componentWillMount() {
      this.socket = createSocket(this.props);
      const listeners = mapData(this.props);
      const cbs = callbacks();

      Object.keys(listeners).forEach((event) => {
        this.socket.on(event, (data) => {
          const updater = (prevState) => {
            const nextProps = listeners[event](data, { ...this.props, ...prevState.props });
            return mergeState(prevState, nextProps);
          };

          const onUpdate = () => {
            const callback = cbs[event];
            if (callback) {
              callback(data, { ...this.state.props, emit: (...args) => this.emit(...args) });
            }
          };

          this.setState(updater, onUpdate);
        });
      });
    }

    componentWillUnmount() {
      if (!keepAlive) {
        this.socket.close();
      }
    }

    emit(...args) {
      this.socket.emit(...args);
    }

    render() {
      const updateProps = (nextProps) => this.update(nextProps);
      const nextProps = { ...this.props, ...this.state.props };
      return createElement(component, {
        ...nextProps,
        ...mapEmit((...args) => this.emit(...args), { ...nextProps, updateProps }),
        updateProps
      });
    }
  }

  return hoistStatics(SocketWrapper, component);
};

export default withSocket;
