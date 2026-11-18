import { defineConfig } from "vite"
import path from "node:path"

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        cmd: path.resolve(__dirname, "src/cmd.ts"),
      },
      formats: ["cjs"],
    },
    outDir: "dist",
    target: "node20",
    rollupOptions: {
      // Externalize all node builtins and all dependencies
      external: [
        /^node:/, // Node builtins
        /^[^./]/, // All bare imports (dependencies)
      ],
      output: {
        exports: "named",
      },
    },
    sourcemap: true,
    minify: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    clearMocks: true,
    coverage: {
      enabled: true,
      provider: "v8",
      reportsDirectory: "coverage",
      exclude: ["node_modules/", "scaffold.config.js", "dist/", "docs/"],
    },
    exclude: ["node_modules", "dist", "docs"],
  },
})
