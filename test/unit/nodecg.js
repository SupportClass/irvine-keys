'use strict';

const NODECG_SERVER_URL = 'http://fakeHost:9121';

// Packages
const mockery = require('mockery');
const sinon = require('sinon');
const test = require('ava');

// Ours
const MockUtil = require('../helpers/mock-util');

const {ipcMain: mockIpcMain, ipcRenderer: mockIpcRenderer} = require('electron-ipc-mock')();
mockery.registerMock('electron', {
	ipcMain: mockIpcMain,
	ipcRenderer: mockIpcRenderer,
	app: {
		getName() {
			return 'irvine-keys';
		}
	}
});
mockery.registerMock('socket.io-client', require('../helpers/mock-socket.io-client'));
mockery.registerMock('./util', MockUtil);
mockery.enable({warnOnUnregistered: false});

// The unit under test. Must be required after we register our mocks.
const singletonNodecg = require('../../app/server/remote-client');

test.beforeEach(t => {
	MockUtil.sendToMainWindow.reset();
	t.context.nodecg = new singletonNodecg.__NodeCGClass__();
});

test.serial('exports a singleton of the NodeCG class', t => {
	t.is(singletonNodecg.constructor.name, 'NodeCG');
});

test.serial('#connect - disconnects if already connected', async t => {
	const nodecg = t.context.nodecg;
	const spy = sinon.spy(nodecg, 'disconnect');
	await nodecg.connect(NODECG_SERVER_URL);
	await nodecg.connect(NODECG_SERVER_URL);
	t.true(spy.calledOnce);
});

test.serial('#disconnect - doesn\'t throw if not currently connected', t => {
	t.notThrows(() => {
		t.context.nodecg.disconnect();
	});
});

test.serial('#emit - sends to local EventEmitter listeners and to the main application window', t => {
	t.plan(3);

	const nodecg = t.context.nodecg;
	nodecg.on('testEvent', (...args) => {
		t.deepEqual(args, ['foo', 'bar', 5]);
	});

	nodecg.emit('testEvent', 'foo', 'bar', 5);

	t.true(MockUtil.sendToMainWindow.calledOnce);
	t.deepEqual(MockUtil.sendToMainWindow.firstCall.args, ['nodecg:testEvent', 'foo', 'bar', 5]);
});

test.serial('#invokeMethod rejects if there is no socket', async t => {
	await t.throws(t.context.nodecg.invokeMethod(), 'Socket is not connected');
});

test.serial('#invokeMethod rejects if the socket is not connected', async t => {
	const nodecg = t.context.nodecg;
	nodecg.socket = {};
	await t.throws(nodecg.invokeMethod(), 'Socket is not connected');
});

test.serial('#invokeMethod rejects if the methodName is not one of the availableMethods', async t => {
	const nodecg = t.context.nodecg;
	await nodecg.connect(NODECG_SERVER_URL);
	await t.throws(nodecg.invokeMethod('notFound'), 'Method "notFound" is not one of the availableMethods');
});

test.serial('#invokeMethod rejects if an error was returned by the invocation', async t => {
	const nodecg = t.context.nodecg;
	await nodecg.connect(NODECG_SERVER_URL);
	nodecg.availableMethods = ['rejectsWithError'];
	sinon.stub(nodecg.socket, 'emit')
		.withArgs('invokeMethod', 'rejectsWithError')
		.yields(new Error('boom'));
	await t.throws(nodecg.invokeMethod('rejectsWithError'), 'boom');
});

test.serial('#invokeMethod resolves with the response from the invocation', async t => {
	const nodecg = t.context.nodecg;
	await nodecg.connect(NODECG_SERVER_URL);
	nodecg.availableMethods = ['resolvesWithValue'];
	sinon.stub(nodecg.socket, 'emit')
		.withArgs('invokeMethod', 'resolvesWithValue')
		.yields(null, ['foo', 'bar', 'baz']);
	t.deepEqual(await nodecg.invokeMethod('resolvesWithValue'), ['foo', 'bar', 'baz']);
});

test.serial('sends pong events to the main application window', async t => {
	const nodecg = t.context.nodecg;
	await nodecg.connect(NODECG_SERVER_URL);
	nodecg.socket.emit('pong', 5);
	t.true(MockUtil.sendToMainWindow.calledOnce);
	t.deepEqual(MockUtil.sendToMainWindow.firstCall.args, ['nodecg:pong', 5]);
});
