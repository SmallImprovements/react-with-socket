import io from 'socket.io-client';
import { Component, createElement } from 'react';

const config = {
    base: 'localhost:8090'
};

const standardSocket = (url) => () => io(`${config.base}/${url}`)
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
            const listeners = createListeners(); // pass props, update when new props come in
            const callbacks = createCallbacks();

            Object.keys(listeners).forEach((event) => {
                this.socket.on(event, (data) => {
                    const nextProps = listeners[event](data);

                    const updater = (prevState) => ({
                        ...prevState.state,
                        props: {
                            ...prevState.props,
                            ...nextProps
                        }
                    });

                    const onUpdate = () => {
                        const callback = callbacks[event];
                        if (callback) {
                            callback(data, this.state.props);
                        }
                    };

                    this.setState(updater, onUpdate);
                })
            });
        }

        componentWillUnmount() {
            this.socket().close();
        }

        render() {
            const emit = (...args) => { this.socket.emit(...args); }
            const nextProps = { ...this.props, ...this.state.props };
            return createElement(component, { ...nextProps, ...createActions(emit, nextProps) });
        }
    }

    return SocketWrapper;
}

export default withSocket;
