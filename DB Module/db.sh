use IoTPlatform;

db.createCollection("Users");
db.createCollection("Devices");
db.createCollection("Bindings");
db.createCollection("Connections");

db.Users.insert([
	{ "username": "admin", "password": "$2b$10$DDeTzlRNfh3puEOroV1sHOaZsdWG4x8L7BIOH4zHa44p4eASlCUNq" } 
]);
db.Devices.insert([
	{ "deviceID": "uclaece1", "IP":"localhost", "port": "4444" },
	{ "deviceID": "uclaece2", "IP":"192.168.0.2" },
	{ "deviceID": "uclaece3", "IP":"192.168.0.3" },
	{ "deviceID": "uclaece4", "IP":"192.168.0.4" },
	{ "deviceID": "uclaece5", "IP":"192.168.0.5" },
	{ "deviceID": "uclaece6", "IP":"192.168.0.6" },
	{ "deviceID": "uclaece7", "IP":"192.168.0.7" },
	{ "deviceID": "uclaece8", "IP":"192.168.0.8" },
	{ "deviceID": "uclaece9", "IP":"192.168.0.9" }
]);
db.Bindings.insert([
	{ "deviceID": "uclaece1", "username":"admin" },
	{ "deviceID": "uclaece2", "username":"admin" },
	{ "deviceID": "uclaece3", "username":"admin" },
	{ "deviceID": "uclaece4", "username":"admin" },
	{ "deviceID": "uclaece5", "username":"admin" },
	{ "deviceID": "uclaece6", "username":"admin" },
	{ "deviceID": "uclaece7", "username":"admin" },
	{ "deviceID": "uclaece8", "username":"admin" },
	{ "deviceID": "uclaece9", "username":"admin" },
	
]);


