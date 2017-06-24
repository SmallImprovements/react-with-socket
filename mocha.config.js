/* eslint-disable import/no-extraneous-dependencies */
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { JSDOM } from 'jsdom';
import React from 'react'; // eslint-disable-line no-unused-vars

chai.use(sinonChai);

const getSelection = () => ({ baseNode: '' });

global.window = new JSDOM('').window;
global.document = global.window.document;
global.document.getSelection = getSelection;
global.window.getSelection = getSelection;

global.navigator = { userAgent: 'browser', platform: 'Linux' };

global.fdescribe = (...args) => describe.only(...args);
global.fit = (...args) => it.only(...args);
global.expect = expect;

