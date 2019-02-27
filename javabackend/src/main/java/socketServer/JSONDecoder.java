package socketServer;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToMessageDecoder;
import requests.ForwardRequest;
import requests.GetAllDeviceRequest;
import requests.RegisterRequest;
import requests.Request;
import utils.RuntimeTypeAdapterFactory;

import java.util.List;

public class JSONDecoder extends MessageToMessageDecoder<String> {

    private static final Gson GSON = new GsonBuilder().create();

    @Override
    public void decode(ChannelHandlerContext ctx, String msg, List<Object> out) throws Exception {
        System.out.println(msg);
        out.add(helper(msg));
    }

    private Request helper(String msg) {
        RuntimeTypeAdapterFactory<Request> rttaf = RuntimeTypeAdapterFactory.of(Request.class)
                // RegisterRequest inheriting types and the values per type field
                .registerSubtype(ForwardRequest.class, "Forward")
                .registerSubtype(RegisterRequest.class, "Register")
                .registerSubtype(GetAllDeviceRequest.class, "GetAll");
        Gson gson = new GsonBuilder().setPrettyPrinting()
                .registerTypeAdapterFactory(rttaf)
                .create();
        return gson.fromJson(msg, Request.class);
    }
}