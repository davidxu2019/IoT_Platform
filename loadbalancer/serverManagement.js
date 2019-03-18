var HashRing = require('hashring');

var ring = new HashRing({
	// 'localhost:8433': { vnodes: 50 },
 //  '127.0.0.1:8433': { vnodes: 50 },
 //  '127.0.0.2:8433': { vnodes: 50 },
 //  '127.0.0.3:8433': { vnodes: 50 },
 //  '127.0.0.4:8433': { vnodes: 50 },
 //  '127.0.0.5:8433': { vnodes: 50 },
 //  '127.0.0.6:8433': { vnodes: 50 }
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



