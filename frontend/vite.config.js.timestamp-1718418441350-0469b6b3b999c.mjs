// vite.config.js
import { defineConfig } from "file:///Users/surkim/cur/frontend/node_modules/vite/dist/node/index.js";
import jsconfigPaths from "file:///Users/surkim/cur/frontend/node_modules/vite-jsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [jsconfigPaths()],
  esbuild: {
    jsx: "transform",
    jsxInject: `import { h } from '@/lib/jsx/jsx-runtime'`,
    jsxFactory: "h"
  },
  resolve: {
    alias: {
      "@": "/src",
      "@img": "/img"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvc3Vya2ltL2N1ci9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3N1cmtpbS9jdXIvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3N1cmtpbS9jdXIvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IGpzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtanNjb25maWctcGF0aHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW2pzY29uZmlnUGF0aHMoKV0sXG4gIGVzYnVpbGQ6IHtcbiAgICBqc3g6IFwidHJhbnNmb3JtXCIsXG4gICAganN4SW5qZWN0OiBgaW1wb3J0IHsgaCB9IGZyb20gJ0AvbGliL2pzeC9qc3gtcnVudGltZSdgLFxuICAgIGpzeEZhY3Rvcnk6IFwiaFwiLFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBcIi9zcmNcIixcbiAgICAgIFwiQGltZ1wiOiBcIi9pbWdcIixcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdRLFNBQVMsb0JBQW9CO0FBQzdSLE9BQU8sbUJBQW1CO0FBRTFCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxjQUFjLENBQUM7QUFBQSxFQUN6QixTQUFTO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
