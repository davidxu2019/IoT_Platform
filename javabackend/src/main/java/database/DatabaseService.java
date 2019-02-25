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
        // TODO: why Intellij says document is always not null?
    }

    /**
     * Database operation that handles register request.
     * database scheme
     *     user_to_device table: username, device_id
     *     devices: device_id, device_ip
     * @param request: the RegisterRequest Object
     * @return Response object
     */
    public static Response register(RegisterRequest request) {
        MongoDatabase database = client.getDatabase("Devices");
        MongoCollection<Document> devices = database.getCollection("devices");
        MongoCollection<Document> userToDevice = database.getCollection("user_to_device");

        List<Document> deviceRecords = new ArrayList<>();
        List<Document> userToDeviceRecords = new ArrayList<>();
        String[] deviceIds = new String[request.deviceIps().length];

        int i = 0;
        for (String deviceIp : request.deviceIps()) {
            deviceIds[i] = createDeviceId(request.user());
            deviceRecords.add(new Document("device_id", deviceIds[i]).append("ip", deviceIp));
            userToDeviceRecords.add(new Document("user", request.user()).append("device_id", deviceIds[i]));
            i++;
        }

        devices.insertMany(deviceRecords);
        userToDevice.insertMany(userToDeviceRecords);

        return new RegisterResponse(deviceIds);
    }

    // TODO: implement method to create device id
    private static long id = 0;
    private static String createDeviceId(String username) {
        id++;
        return id + "";
    }

}
