package responses;

public class RegisterResponse extends Response {

    public static abstract class DeviceRegisterStatus {
        final boolean status;
        DeviceRegisterStatus(boolean status) {
            this.status = status;
        }
        public boolean status() {
            return this.status;
        }
    }

    public static class DeviceRegisterFailed extends DeviceRegisterStatus {
        private final String cause;
        public DeviceRegisterFailed(String cause) {
            super(false);
            this.cause = cause;
        }
    }

    public static class DeviceRegisterSuccess extends DeviceRegisterStatus {
        private final String deviceId;
        private final String deviceName;
        public DeviceRegisterSuccess(String deviceId, String deviceName) {
            super(true);
            this.deviceId = deviceId;
            this.deviceName = deviceName;
        }
    }

    private DeviceRegisterStatus[] statuses;


    public RegisterResponse() {}
    public RegisterResponse(DeviceRegisterStatus[] statuses) {this.statuses = statuses;}
}
