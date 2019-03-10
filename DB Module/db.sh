use IoTPlatform;
db.createCollection("Users");
db.createCollection("Devices");
db.createCollection("Bindings");
db.Users.insert([
	{ "username": "admin", "password": "cs219" },
	{ "username": "user1", "password": "password" }   
]);
db.Devices.insert([
	{ "deviceID": "1user1", "IP":"127.0.0.1", "port": "4444" }
]);
db.Bindings.insert([
	{ "username": "admin", "deviceID": "1user1"},
	{ "username": "user1", "deviceID": "1user1"}
]);
