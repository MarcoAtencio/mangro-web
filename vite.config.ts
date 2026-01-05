import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // Solo separamos Firebase porque es gigante y seguro de aislar
                        if (id.includes('firebase') || id.includes('@firebase')) {
                            return 'firebase';
                        }
                        // Dejar todo lo demás en un solo vendor chunk para evitar problemas
                        // de orden de carga con React (useLayoutEffect error, Cannot read properties of undefined)
                        return 'vendor';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
});
