package requests;

public class ForwardRequest extends Request {

    private static class ForwardContent extends Content {
        private String deviceId;
    }
    private ForwardContent content;
    public String deviceId() {
        return content.deviceId;
    }
}
