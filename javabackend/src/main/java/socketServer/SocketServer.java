package socketServer;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelOption;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;

public class SocketServer {
    private int port = 4444;
    private NioEventLoopGroup bossGroup = new NioEventLoopGroup(2); // 2 threads
    private NioEventLoopGroup workerGroup = new NioEventLoopGroup(10); // 10 threads

    public void run() throws InterruptedException {
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .handler(new LoggingHandler(LogLevel.INFO))
                    .childHandler(new SocketServerInitializer())
                    .option(ChannelOption.SO_BACKLOG, 5)
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            Channel ch = b.bind(port).sync().channel();

            ch.closeFuture().sync();

        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        SocketServer server = new SocketServer();
        server.run();
    }
}
