package requests;

import com.google.gson.annotations.SerializedName;

public enum RequestType {
    @SerializedName("Login")
    Login,
    @SerializedName("SignUp")
    SignUp,
    @SerializedName("Register")
    Register,
    @SerializedName("Forward")
    Forward
}
