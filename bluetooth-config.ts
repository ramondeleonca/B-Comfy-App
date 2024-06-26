import { Platform } from "react-native";
import { PERMISSIONS } from "react-native-permissions";

export const BLE_USER_SERVICE_UUID = "533ba0d8-b14b-4efa-be28-653a9c68ca2a";
export const BLE_USER_NAME_CHARACTERISTIC_UUID = "06764004-4c58-47aa-a2c5-3c920c8f0be9";
export const BLE_USER_PHONE_CHARACTERISTIC_UUID = "220730ac-7422-4925-9720-8d13dabbd808";
export const BLE_USER_CONDITION_CHARACTERISTIC_UUID = "db62c06a-e8b3-4e5f-8ac7-174a9e031ac3";

export const NAME_REGEX = /^BComfy\.(([A-z]|[0-9]){2}|(test))$/gi;

export const ANDROID_PERMISSIONS = [
    // PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    // PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION
]

export const IOS_PERMISSIONS = [
    PERMISSIONS.IOS.BLUETOOTH,
    // PERMISSIONS.IOS.LOCATION_ALWAYS
]

export const PLATFORM_PERMISSIONS = Platform.OS == "android" ? ANDROID_PERMISSIONS : IOS_PERMISSIONS;