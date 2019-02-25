package requests;

import com.google.gson.Gson;
import org.junit.Test;

import static org.junit.Assert.*;

public class RegisterRequestTest {

    private static Gson gson = new Gson();

    @Test
    public void decode() {
        String jsonString = "{\n" +
                "\"user\": \"TianHe\",\n" +
                "\"deviceIps\":[\"abc\", \"def\", \"ghi\"]\n" +
                "}\n";
        RegisterRequest registerRequest = gson.fromJson(jsonString, RegisterRequest.class);
        assertArrayEquals(new String[] {"abc", "def", "ghi"}, registerRequest.deviceIps());
        assertEquals("TianHe", registerRequest.user());
    }
}