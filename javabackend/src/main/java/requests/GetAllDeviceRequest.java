package requests;

public class GetAllDeviceRequest extends Request {
    private static class GetAllDeviceContent extends Content {
        private String user;
    }

    private GetAllDeviceContent content;

    public String user() {
        return content.user;
    } // TODO: deal with NPE
}
