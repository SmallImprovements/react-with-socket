import io from 'socket.io-client';
import { Component, createElement } from 'react';

const getSocket = (url) => io(`localhost:8090/${url}`);

const withSocket = (createListeners, url = '') => (component) => {
    class SocketWrapper extends Component {
        constructor(props) {
            super(props);
            this.state = { props: {} };
        }
        componentWillMount() {
            this.socket = getSocket(url);
            const listeners = createListeners(); // pass props, update when new props come in
            Object.keys(listeners).forEach((event) => {
                this.socket.on(event, (data) => {
                    console.log('event', data);
                    const nextProps = listeners[event](data);
                    this.setState((prevState) => ({
                        ...prevState.props,
                        ...nextProps
                    }));
                })
            });
        }

        componentWillUnmount() {
            this.socket().close();
        }

        render() {
            const emit = (...args) => { this.socket.emit(...args); }
            return createElement(component, { ...this.props, ...this.state.props, emit });
        }
    }

    return SocketWrapper;
}

export default withSocket;
