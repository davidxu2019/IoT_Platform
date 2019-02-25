package socketServer;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToMessageEncoder;
import responses.Response;

import java.util.List;

public class JSONEncoder extends MessageToMessageEncoder<Response> {

    private Gson gson = new GsonBuilder().setPrettyPrinting().create();

    @Override
    public void encode(ChannelHandlerContext ctx, Response message, List<Object> out)
            throws Exception {
        out.add(gson.toJson(message));
    }
}