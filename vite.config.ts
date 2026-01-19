import netlify from "@netlify/vite-plugin-tanstack-start";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  server: {
    host: "lego-control-center.localhost",
  },
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    netlify(),
    viteReact(),
    checker({ typescript: true }),
  ],
});

export default config;
