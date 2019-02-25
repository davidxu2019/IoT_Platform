package responses;

public class RegisterResponse extends Response {
    private String[] ids;

    public RegisterResponse() {}
    public RegisterResponse(String[] ids) {this.ids = ids;}
}
