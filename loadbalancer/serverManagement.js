var HashRing = require('hashring');

/**
TODOs:
(1) check if url has been added before when addServer is called
(2) provide retry functions. (the chosen slave server can go down, so we need provide multiple slaves)
*/

var ring = new HashRing({
});

function getServer(req) {
	return ring.get(req);
}

function addServer(ip) {
	ring.add(ip);
}

function removeServer(ip) {
	ring.remove(ip);
}

function getAllServers(req) {
	return ring.range();
}

module.exports = {
	getServer,
	addServer,
	removeServer,
	getAllServers
}



