'use strict';

// Packages

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var protobuf = require('protobufjs');

module.exports = {
	loadFromDisk: function () {
		var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(filePath) {
			var root, services, service;
			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_context.next = 2;
							return protobuf.load(filePath);

						case 2:
							root = _context.sent;

							root.resolveAll();

							services = findServices(root);

							if (!(services.size === 1)) {
								_context.next = 8;
								break;
							}

							service = services.values().next().value;
							return _context.abrupt('return', {
								pbjsRoot: root,
								servicePath: services.keys().next().value,
								serviceSummary: summarizeService(service)
							});

						case 8:
							if (!(services.size === 0)) {
								_context.next = 12;
								break;
							}

							throw new Error('No service definitions found in this protocol. ' + 'Please load a protocol with exactly one service definition.');

						case 12:
							throw new Error('Protocol contains multiple services. This is currently not supported. ' + 'Please load a protocol with exactly one service definition.');

						case 13:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		}));

		function loadFromDisk(_x) {
			return _ref.apply(this, arguments);
		}

		return loadFromDisk;
	}(),
	reflectFromService: function () {
		var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(serviceAddress) {
			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							throw new Error('Not implemented yet.');

						case 1:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, this);
		}));

		function reflectFromService(_x2) {
			return _ref2.apply(this, arguments);
		}

		return reflectFromService;
	}()
};

/**
 * Recursively discovers all defined services in a Protobuf.js object.
 * @param rootOrNamespace {Root|Namespace} - A Protobuf.js Root or Namespace instance.
 * @param [path=[]] {Array}
 * @returns {Map} - A Map of all discovered services. Keys are dot-separated paths.
 */
function findServices(rootOrNamespace) {
	var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

	var services = new Map();
	if (!rootOrNamespace || !rootOrNamespace.nested) {
		return services;
	}

	var nested = rootOrNamespace.nested;
	for (var key in nested) {
		if (!{}.hasOwnProperty.call(nested, key)) {
			continue;
		}

		var newPath = path.concat([key]);
		if (nested[key] instanceof protobuf.Service) {
			services.set(newPath.join('.'), nested[key]);
		} else if (nested[key].nested) {
			var foundServices = findServices(nested[key], newPath);
			foundServices.forEach(function (value, key) {
				services.set(key, value);
			});
		}
	}

	return services;
}

/**
 * Creates a summary of a Protobuf.js Service object.
 * These summaries are used by the frontend to generate the UI.
 * @param service {Service}
 * @returns {{reflected: boolean, serviceName: string, supportsDynamicEnumerations: boolean, availableProcedures: Array}}
 */
function summarizeService(service) {
	return {
		reflected: false,
		serviceName: service.name,
		supportsDynamicEnumerations: Object.keys(service.methods).includes('GetDynamicEnumerations'),
		availableProcedures: Object.values(service.methods).map(function (method) {
			return {
				name: method.name,
				fields: Object.values(method.resolvedRequestType.fields).map(function (field) {
					return {
						id: field.id,
						name: field.name,
						type: field.type,
						defaultValue: field.defaultValue,
						optional: field.optional,
						required: field.required,
						options: field.options,
						repeated: field.repeated
					};
				})
			};
		})
	};
}