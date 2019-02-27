package responses;

public class GetAllDeviceResponse extends Response {
    public static class Device {
        private String deviceName;
        private String deviceUser;
        private String deviceIp;
        public Device(String deviceName, String deviceUser, String deviceIp) {
            this.deviceIp = deviceIp;
            this.deviceName = deviceName;
            this.deviceUser = deviceUser;
        }
    }

    private Device[] devices;

    public GetAllDeviceResponse(Device[] devices) {
        this.devices = devices;
    }

    public Device[] devices() {
        return this.devices;
    }
}
