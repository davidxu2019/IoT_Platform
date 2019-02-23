use IoTPlatform;
db.createCollection("Users");
db.createCollection("Devices");
db.createCollection("BindingTable");
db.Users.insert([
	{ "username": "admin", "password": "cs219" },
	{ "username": "user1", "password": "password" }   
]);
db.Devices.insert([
	{ "deviceid": "1user1", "IP":"192.168.0.1" }
]);
db.BindingTable.insert([
	{ "username": "admin", "deviceid": "1user1"},
	{ "username": "user1", "deviceid": "1user1"}
]);
