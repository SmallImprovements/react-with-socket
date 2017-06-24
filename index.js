import io from 'socket.io-client';
import { Component, createElement } from 'react';

const getSocket = (url) => io(`localhost:8090/${url}`);

const withSocket = (
    createListeners,
    createActions,
    createCallbacks = () => ({}),
    url = ''
) => (component) => {
    class SocketWrapper extends Component {
        constructor(props) {
            super(props);
            this.state = { props: {} };
        }
        
        componentWillMount() {
            this.socket = getSocket(url);
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
            const { props } = this.state;
            const nextProps = { ...this.props, ...this.stateProps };
            const actionProps = createActions ? createActions(emit, nextProps) : { emit };
            return createElement(component, { ...nextProps, ...actionProps });
        }
    }

    return SocketWrapper;
}

export default withSocket;
