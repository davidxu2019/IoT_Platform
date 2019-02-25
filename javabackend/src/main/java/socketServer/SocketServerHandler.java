package socketServer;

import database.DatabaseService;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import requests.*;
import responses.Response;

public class SocketServerHandler extends SimpleChannelInboundHandler<Request> {

    @Override
    public void channelRead0(ChannelHandlerContext ctx, Request request) throws Exception {
        ctx.writeAndFlush(handleRequest(request));
    }

    private Response handleRequest(Request request) {
        if (request instanceof ForwardRequest) {
            return handleForward((ForwardRequest) request);
        }
        if (request instanceof RegisterRequest) {
            return handleRegister((RegisterRequest) request);

        }
        return null; // TODO: change into a default NOT_FOUND message
    }

    private Response handleForward(ForwardRequest request) {
        return DatabaseService.getIP(request);
    }

    private Response handleRegister(RegisterRequest request) {
        return DatabaseService.register(request);
    }
}
