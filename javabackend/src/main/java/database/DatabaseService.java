package database;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import requests.ForwardRequest;
import requests.RegisterRequest;
import responses.ForwardResponse;
import responses.RegisterResponse;
import responses.Response;

import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

public class DatabaseService {
    private static final MongoClient client = new MongoClient( "localhost" , 27017 );

    /**
     * Database operation that handles forward request.
     * @param request: the ForwardRequest Object
     * @return Response object
     */
    // TODO: may need to change the name
    public static Response getIP(ForwardRequest request) {
        MongoDatabase database = client.getDatabase("Devices");
        MongoCollection<Document> collection = database.getCollection("device_ips");
        Document document = collection.find(eq("device_id", request.deviceId())).first();
        return document == null ? new ForwardResponse() : new ForwardResponse(document.get("ip").toString());
    }

    /**
     * Database operation that handles register request.
     * database scheme
     *     Devices: username, nickname, IP
     * @param request: the RegisterRequest Object
     * @return Response object
     */
    public static Response register(RegisterRequest request) {
        MongoDatabase database = client.getDatabase("Devices");
        MongoCollection<Document> devices = database.getCollection("Devices");

        List<Document> deviceRecords = new ArrayList<>();
        RegisterResponse.DeviceRegisterStatus[] statuses = new RegisterResponse.DeviceRegisterStatus[request.deviceIps().length];
        for (int i = 0; i < request.deviceIps().length; i++) {
            if (ipInvalid(request.deviceIps()[i])) {
                statuses[i] = new RegisterResponse.DeviceRegisterFailed("IP already occupied");
            } else if (deviceNameInvalid(request.user(), request.deviceNames()[i])) {
                statuses[i] = new RegisterResponse.DeviceRegisterFailed(
                        "Device name: " + request.deviceNames()[i] + " is already registered under " + request.user()
                );
            } else {
                deviceRecords.add(
                        new Document("username", request.user())
                                .append("IP", request.deviceIps()[i])
                                .append("deviceName", request.deviceNames()[i])
                );
                String username = request.user();
                String deviceName = request.deviceNames()[i];
                statuses[i] = new RegisterResponse.DeviceRegisterSuccess(createDeviceId(username, deviceName), deviceName);
                devices.insertMany(deviceRecords);
            }
        }
        return new RegisterResponse(statuses);
    }

    private static String createDeviceId(String username, String deviceName) {
        return username + "-" + deviceName;
    }

    private static boolean ipInvalid(String ip) {
        MongoDatabase database = client.getDatabase("Devices");
        MongoCollection<Document> devices = database.getCollection("Devices");
        return devices.find(eq("IP", ip)).first() != null;
    }

    private static boolean deviceNameInvalid(String user, String deviceName) {
        MongoDatabase database = client.getDatabase("Devices");
        MongoCollection<Document> devices = database.getCollection("Devices");
        return devices.find(and(eq("username", user), eq("deviceName", deviceName))).first() != null;
    }

}
