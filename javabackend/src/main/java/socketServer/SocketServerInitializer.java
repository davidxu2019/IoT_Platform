package socketServer;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.LineBasedFrameDecoder;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.codec.string.StringEncoder;
import io.netty.util.CharsetUtil;

public class SocketServerInitializer extends ChannelInitializer<SocketChannel> {

    @Override
    public void initChannel(SocketChannel ch) {
        ChannelPipeline pipeline = ch.pipeline();

        pipeline.addLast(LineBasedFrameDecoder.class.getName(),
                new LineBasedFrameDecoder(256));

        pipeline.addLast(StringEncoder.class.getName(),
                new StringEncoder(CharsetUtil.UTF_8));

        pipeline.addLast(StringDecoder.class.getName(),
                new StringDecoder(CharsetUtil.UTF_8));

        pipeline.addLast(JSONDecoder.class.getName(),
                new JSONDecoder());

        pipeline.addLast(JSONEncoder.class.getName(),
                new JSONEncoder());

        pipeline.addLast(new SocketServerHandler());
    }
}
