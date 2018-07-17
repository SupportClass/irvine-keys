'use strict';

// Packages
const protobuf = require('protobufjs');

module.exports = {
	async loadFromDisk(filePath) {
		const root = await protobuf.load(filePath);
		root.resolveAll();

		const services = findServices(root);
		if (services.size === 1) {
			const service = services.values().next().value;
			return {
				pbjsRoot: root,
				servicePath: services.keys().next().value,
				serviceSummary: summarizeService(service)
			};
		}

		if (services.size === 0) {
			throw new Error('No service definitions found in this protocol. ' +
				'Please load a protocol with exactly one service definition.');
		} else {
			throw new Error('Protocol contains multiple services. This is currently not supported. ' +
				'Please load a protocol with exactly one service definition.');
		}
	},

	async reflectFromService(serviceAddress) { // eslint-disable-line no-unused-vars
		throw new Error('Not implemented yet.');
	}
};

/**
 * Recursively discovers all defined services in a Protobuf.js object.
 * @param rootOrNamespace {Root|Namespace} - A Protobuf.js Root or Namespace instance.
 * @param [path=[]] {Array}
 * @returns {Map} - A Map of all discovered services. Keys are dot-separated paths.
 */
function findServices(rootOrNamespace, path = []) {
	const services = new Map();
	if (!rootOrNamespace || !rootOrNamespace.nested) {
		return services;
	}

	const nested = rootOrNamespace.nested;
	for (const key in nested) {
		if (!{}.hasOwnProperty.call(nested, key)) {
			continue;
		}

		const newPath = path.concat([key]);
		if (nested[key] instanceof protobuf.Service) {
			services.set(newPath.join('.'), nested[key]);
		} else if (nested[key].nested) {
			const foundServices = findServices(nested[key], newPath);
			foundServices.forEach((value, key) => {
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
		availableProcedures: Object.values(service.methods).map(method => {
			return {
				name: method.name,
				fields: Object.values(method.resolvedRequestType.fields).map(field => {
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
