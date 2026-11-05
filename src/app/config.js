// Base URL of the Flask prediction backend (Ultrasound-backend).
// Set NEXT_PUBLIC_API_URL in .env.local; defaults to the local dev server.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7860').replace(/\/$/, '');
