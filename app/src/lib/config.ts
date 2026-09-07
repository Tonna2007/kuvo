/** Production backend on Render. Override with EXPO_PUBLIC_API_URL for local dev. */
const PROD_API = 'https://kuvo.onrender.com';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || PROD_API;
