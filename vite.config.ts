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
    rollupOptions: {
      external: [
        "node:os",
        "node:path",
        "node:fs",
        "node:fs/promises",
        "node:constants",
        "node:child_process",
        "node:util",
        "date-fns",
        "date-fns/add",
        "date-fns/format",
        "date-fns/parseISO",
        "glob",
        "handlebars",
        "handlebars/runtime",
        "massarg",
        "massarg/command",
      ],
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
