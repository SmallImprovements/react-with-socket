/* eslint-disable no-unused-expressions */
import { createElement } from 'react';
import ReactTestUtils from 'react-dom/test-utils'; // ES6
import ReactDOM from 'react-dom';
import sinon from 'sinon';

import withSocket, { setSocketConstructor } from '.';

const delay = () => new Promise(res => setTimeout(() => res(), 1));


const nullComp = () => null;
const noop = () => {};
const spyComponent = () => sinon.stub().returns(null);

const spySocket = () => ({
  emit: sinon.spy(),
  on: sinon.spy(),
  close: sinon.spy()
});

const noopSocket = () => ({
  emit: noop,
  on: noop,
  close: noop
});

const spySocketConstructor = () => sinon.stub().returns(spySocket());
const noopSocketConstructor = () => noopSocket;
const mockSocketConstructor = () => {
  const allListeners = {};

  const close = sinon.spy();
  const emit = sinon.spy();

  const on = (event, cb) => {
    const listeners = allListeners[event] || [];
    listeners.push(cb);
    allListeners[event] = listeners;
  };

  const trigger = (event, data) => {
    const listeners = allListeners[event] || [];
    listeners.forEach(listener => listener(data));
  };

  return { close, emit, on, trigger };
};

const render = (component, props) => {
  const el = createElement(component, props);
  return ReactTestUtils.renderIntoDocument(el);
};

describe('withSocket', () => {
  it('throws when no socket constructor is defined', () => {
    const spy = spyComponent();
    const comp = withSocket()(spy);

    expect(() => render(comp, {})).to.throw;
  });

  it('opens a socket on mount', () => {
    const socketSpy = spySocketConstructor();
    setSocketConstructor(socketSpy);
    const comp = withSocket()(nullComp);

    render(comp, {});

    expect(socketSpy).to.have.been.called;
  });

  it('closes the socket on unmount', () => {
    const socketSpy = spySocketConstructor();
    setSocketConstructor(socketSpy);
    const container = global.document.createElement('div');
    const comp = withSocket()(nullComp);
    const renderedComp = ReactDOM.render(createElement(comp, {}), container);
    ReactDOM.unmountComponentAtNode(container);
    expect(renderedComp.socket.close).to.have.been.called;
  });

  it('can optionally keep the socket alive on unmount', () => {
    const socketSpy = spySocketConstructor();
    setSocketConstructor(socketSpy);
    const container = global.document.createElement('div');
    const comp = withSocket({ keepAlive: true })(nullComp);
    const renderedComp = ReactDOM.render(createElement(comp, {}), container);
    ReactDOM.unmountComponentAtNode(container);
    expect(renderedComp.socket.close).not.to.have.been.called;
  });

  it('renders the given component', () => {
    const socketSpy = spySocketConstructor();
    setSocketConstructor(socketSpy);
    const spy = spyComponent();
    const comp = withSocket()(spy);

    render(comp, {});

    expect(socketSpy).to.have.been.called;
    expect(spy).to.have.been.called;
  });

  it('renders with an optional initial state', () => {
    setSocketConstructor(noopSocketConstructor);
    const spy = spyComponent();
    const initialState = { x: 1, y: 2};
    const comp = withSocket({ initialState })(spy);

    render(comp, {});

    expect(spy).to.have.been.calledWith(sinon.match(initialState));
  });

  it('passes down original props', () => {
    setSocketConstructor(noopSocketConstructor);
    const spy = spyComponent();
    const originalProps = { x: 1, y: 2};
    const comp = withSocket()(spy);

    render(comp, originalProps);

    expect(spy).to.have.been.calledWith(sinon.match(originalProps));
  });

  it('passes emit function down when no actions are mapped', () => {
    setSocketConstructor(noopSocketConstructor);
    const spy = spyComponent();
    const comp = withSocket()(spy);

    render(comp, {});

    expect(spy).to.have.been.calledWith(sinon.match({ emit: sinon.match.func }));
  });

  it('passed down emit functions emits on the socket', () => {
    setSocketConstructor(mockSocketConstructor);
    const testData = { x: 1 };
    const comp = withSocket()(({ emit }) => { emit('test', testData); return null; });

    const rendered = render(comp, {});

    expect(rendered.socket.emit).to.have.been.calledWith('test', testData);
  });

  it('does not pass when custom action mapper is defined', () => {
    setSocketConstructor(noopSocketConstructor);
    const spy = spyComponent();
    const comp = withSocket({ mapEmit: () => ({}) })(spy);

    render(comp, {});

    expect(spy).not.to.have.been.calledWith(sinon.match({ emit: sinon.match.func }));
  });

  it('allows to map emit handler to actions', () => {
    setSocketConstructor(mockSocketConstructor);
    const initialState = { x: 1 };
    const testArg = 'a';
    const comp = withSocket({
      initialState,
      mapEmit: (emit, props) => ({
        actions: {
          test: (arg) => emit('test', { props, arg })
        }
      })
    })(({ actions }) => {
      actions.test(testArg);
      return null;
    });

    const rendered = render(comp, {});

    expect(rendered.socket.emit).to.have.been.calledWith('test', sinon.match({
      props: sinon.match(initialState),
      arg: testArg
    }));
  });


  it('passed down action functions can use updateProps to update immediately', () => {
    const spy = spyComponent();
    setSocketConstructor(mockSocketConstructor);
    const initialState = { x: 1 };
    const testArg = 'a';
    const comp = withSocket({
      initialState,
      mapEmit: (emit, props) => ({
        actions: {
          test: (arg) => {
            emit('test', { props, arg });
            props.updateProps({ y: 2 });
          }
        }
      })
    })(({ actions, y }) => {
      spy(y);
      setTimeout(() => {
        actions.test(testArg);
      });
      return null;
    });

    render(comp, {});

    return delay().then(() => {
      expect(spy).to.have.been.calledWith(2);
    });
  });

  it('maps new incoming data and updates', () => {
    const spy = spyComponent();
    setSocketConstructor(mockSocketConstructor);
    const testData = { x: 1 };
    const comp = withSocket({
      mapData: () => ({
        test: (data) => ({ mappedData: data })
      })
    })(spy);

    const rendered = render(comp, {});

    expect(spy).to.have.been.calledOnce;

    rendered.socket.trigger('test', testData);

    expect(spy).to.have.been.calledTwice;
    expect(spy).to.have.been.calledWith(sinon.match({
      mappedData: testData
    }));
  });

  it('allows to override the socket constructor, which has access to props', () => {
    const otherSpySocket = sinon.spy();
    setSocketConstructor(spySocketConstructor);
    const comp = withSocket({
      createSocket: (props) => otherSpySocket(props)
    })(nullComp);

    const props = { x: 1 };

    render(comp, props);

    expect(otherSpySocket).to.have.been.calledWith(sinon.match(props));
  });

  it('passes an updateProps fn to update outside of sockets - (think optimistic updates)', () => {
    const spy = spyComponent();
    setSocketConstructor(mockSocketConstructor);
    const comp = withSocket({
      initialState: { msgs: [] }
    })((props) => {
      spy(props);
      if (!props.msgs.length) {
        // fake user interaction by calling something with a delay
        setTimeout(() => {
          props.updateProps({ msgs: [1] });
        });
      }
      return null;
    });

    render(comp, {});

    return delay().then(() => {
      expect(spy).to.have.been.calledTwice;
    });
  });
});

