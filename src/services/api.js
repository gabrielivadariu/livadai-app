import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// For production, set EXPO_PUBLIC_API_URL to your HTTPS API base.
// For local dev, set EXPO_PUBLIC_API_URL_DEV or fall back to LAN IP.
// - Android emulator: http://10.0.2.2:4000
// - iOS simulator (same Mac as backend): http://localhost:4000
// - Real device on LAN: http://YOUR_LAN_IP:4000 (e.g., http://192.168.0.150:4000)
const DEV_BASE_URL = process.env.EXPO_PUBLIC_API_URL_DEV || "http://192.168.0.150:4000";
const PROD_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_BASE_URL;
const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
