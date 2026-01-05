import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./app/test/setup.ts"],
        include: ["app/**/*.{test,spec}.{ts,tsx}"],
        exclude: ["node_modules", "build", ".react-router"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["app/**/*.{ts,tsx}"],
            exclude: ["app/**/*.{test,spec}.{ts,tsx}", "app/test/**"],
        },
    },
});
