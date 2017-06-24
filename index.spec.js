/* eslint-disable no-unused-expressions */
import { createElement } from 'react';
import ReactTestUtils from 'react-dom/test-utils'; // ES6
import ReactDOM from 'react-dom';
import sinon from 'sinon';

import withSocket, { setSocketConstructor } from '.';

const spySocket = () => ({
  emit: sinon.spy(),
  on: sinon.spy(),
  close: sinon.spy()
});

const spySocketConstructor = () => sinon.stub().returns(spySocket());

const createSpyComponent = () => sinon.stub().returns(null);

const render = (component, props) => {
  const el = createElement(component, props);
  return ReactTestUtils.renderIntoDocument(el);
};

describe('withSocket', () => {
  it('renders', () => {
    const socketSpy = spySocketConstructor();
    setSocketConstructor(socketSpy);
    const spy = createSpyComponent();
    const comp = withSocket()(spy);

    render(comp, {});

    expect(socketSpy).to.have.been.called;
    expect(spy).to.have.been.called;
  });

  it('closes the socket on unmount', () => {
    const socketSpy = spySocketConstructor();
    setSocketConstructor(socketSpy);
    const container = global.document.createElement('div');
    const comp = withSocket()(() => null);
    const renderedComp = ReactDOM.render(createElement(comp, {}), container);
    ReactDOM.unmountComponentAtNode(container);
    expect(renderedComp.socket.close).to.have.been.called;
  });
});

