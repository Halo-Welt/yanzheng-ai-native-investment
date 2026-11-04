import { defineConfig } from "vite";
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: false,
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq, req) => {
            proxyReq.setHeader("x-forwarded-host", req.headers.host);
          });
        },
      },
    },
  },
});
