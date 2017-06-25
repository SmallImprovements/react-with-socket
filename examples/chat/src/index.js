import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import { setSocketConstructor } from '../../../src';
import App from './app';

setSocketConstructor(io);

ReactDOM.render(<App />, document.getElementById('app'));

