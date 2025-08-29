import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'lucide-react/dist/esm/icons/chrome': path.resolve(__dirname, 'src/components/ChromeIconStub.js'),
      'lucide-react/dist/esm/icons/chrome.js': path.resolve(__dirname, 'src/components/ChromeIconStub.js')
    }
  }
});
