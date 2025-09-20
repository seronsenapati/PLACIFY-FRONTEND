import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://placify-backend-3wpm.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        // Add timeout and error handling
        timeout: 30000,
        proxyTimeout: 30000,
        onError: (err, req, res) => {
          console.error('Proxy error:', err);
          res.writeHead(500, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({ error: 'Proxy error occurred' }));
        }
      }
    }
  },
  // Add build optimization settings
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit to reduce warnings
  }
});