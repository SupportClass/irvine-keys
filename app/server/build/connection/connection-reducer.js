'use strict';

// Ours

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var RpcClient = require('../classes/rpc-client');

var _require = require('../util'),
    references = _require.references;

// This method of building the types object may seem unusual,
// but it keeps things DRY while still enabling autocomplete.


var types = {
	CONNECT_TO_SERVER: 'CONNECT_TO_SERVER'
};
types = _extends({}, types, {
	CONNECT_TO_SERVER_PENDING: types.CONNECT_TO_SERVER + '_PENDING',
	CONNECT_TO_SERVER_FULFILLED: types.CONNECT_TO_SERVER + '_FULFILLED',
	CONNECT_TO_SERVER_REJECTED: types.CONNECT_TO_SERVER + '_REJECTED'
});

var actions = {
	connectToServer: function connectToServer(serverAddress) {
		return function (dispatch, getState) {
			var _this = this;

			var service = references.activeRpcService;
			dispatch({
				type: types.CONNECT_TO_SERVER,
				payload: _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
					var client;
					return regeneratorRuntime.wrap(function _callee$(_context) {
						while (1) {
							switch (_context.prev = _context.next) {
								case 0:
									client = new RpcClient({ serverAddress: serverAddress, proto: proto, servicePath: servicePath });
									_context.next = 3;
									return client.waitForReady();

								case 3:
									references.activeRpcClient = client;
									return _context.abrupt('return', client);

								case 5:
								case 'end':
									return _context.stop();
							}
						}
					}, _callee, _this);
				}))()
			});
		};
	}
};

function reducer() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case types.CONNECT_TO_SERVER_PENDING:
			return _extends({}, state, {
				connecting: true
			});
		case types.CONNECT_TO_SERVER_FULFILLED:
			return _extends({}, state, {
				connecting: false,
				address: action.payload.address
			});
		case types.CONNECT_TO_SERVER_REJECTED:
			return _extends({}, state, {
				connecting: false
			});
		default:
			return state;
	}
}

Object.freeze(types);
Object.freeze(actions);
module.exports = { types: types, actions: actions, reducer: reducer };