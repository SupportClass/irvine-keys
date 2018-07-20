'use strict';

// Native
const path = require('path');

// Packages
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const ADDRESS = '0.0.0.0:51402';
const PROTO_PATH = path.join(__dirname, 'irvine_framework.proto');

// Suggested options for similarity to existing grpc.load behavior
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// The protoDescriptor object has the full package hierarchy
const irvine = protoDescriptor.irvine;

async function stub(call, callback) {
	console.log('stub start, waiting for 1s...');
	await sleep(1000);
	callback(null, true);
	console.log('stub finish, callback invoked!');
}

function getServer() {
	const server = new grpc.Server();
	server.addService(irvine.IrvineFramework.service, {
		getDynamicEnumerations: stub,
		transition: stub,
		setPreviewScene: stub,
		getScenes: stub
	});
	return server;
}

function sleep(milliseconds) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, milliseconds);
	});
}

const irvineServer = getServer();
irvineServer.bind(ADDRESS, grpc.ServerCredentials.createInsecure());
irvineServer.start();
console.log('Demo server running on', ADDRESS);
