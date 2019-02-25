package requests;

public abstract class Request {
    private RequestType type;
    public static class Content {
        String password;
    }

    public RequestType type() {
        return this.type;
    }
}
