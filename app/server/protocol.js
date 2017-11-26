'use strict';

const protobuf = require('protobufjs');

module.exports = {
	async load(filePath) {
		const root = await protobuf.load(filePath);
		root.resolveAll();

		const services = findServices(root);
		if (services.size === 1) {
			console.log('Only one service found! We can autoselect it.');
		} else {
			console.log('Found multiple services (%d), user needs to be prompted.', services.length);
		}
		console.log(services);
	}
};

/**
 * Recursively discovers all defined services in a protobuf.
 * @param rootOrNamespace {Root|Namespace} - A protobuf.js Root or Namespace instance.
 * @param [path=[]] {Array}
 * @returns {Map} - A Map of all discovered services. Keys are dot-separated paths.
 */
function findServices(rootOrNamespace, path = ['root']) {
	const services = new Map();
	if (!rootOrNamespace || !rootOrNamespace.nested) {
		return services;
	}

	const nested = rootOrNamespace.nested;
	for (const key in nested) {
		if (!{}.hasOwnProperty.call(nested, key)) {
			continue;
		}

		const newPath = path.concat(['nested', key]);
		if (nested[key] instanceof protobuf.Service) {
			services.set(newPath.join('.'), nested[key]);
		} else if (nested[key].nested) {
			const foundServices = findServices(nested[key], newPath);
			foundServices.forEach((key, value) => {
				services.set(key, value);
			});
		}
	}

	return services;
}
