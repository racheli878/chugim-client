import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// הפורט 5173 קבוע: זו הכתובת שהשרת מתיר ב-CORS בסביבת פיתוח.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true }
});
