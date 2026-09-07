import { Platform } from 'react-native';

/** LAN IP of the machine running `go run ./cmd/api`. Change if your Wi‑Fi address differs. */
const LAN_API = 'http://192.168.110.159:8080';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? LAN_API : 'http://localhost:8080');
