import { defineConfig } from "vite";
import jsconfigPaths from "vite-jsconfig-paths";

export default defineConfig({
  plugins: [jsconfigPaths()],
  esbuild: {
    jsx: "transform",
    jsxInject: `import { h } from '@/lib/jsx/jsx-runtime'`,
    jsxFactory: "h",
  },
  resolve: {
    alias: {
      "@": "/src",
      "@img": "/img",
    },
  },
});
