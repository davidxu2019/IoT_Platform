package requests;


public class RegisterRequest extends Request {

    private static class RegisterContent extends Content {
        private String[] deviceIps;
        private String[] deviceNames;
        private String user;
    }

    private RegisterContent content;

    public String user() {
        return content.user;
    } // TODO: deal with NPE

    public String[] deviceIps() {
        return content.deviceIps;
    }

    public String[] deviceNames() {return content.deviceNames;}
}
