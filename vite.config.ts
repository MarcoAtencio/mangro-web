import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    build: {
        // 🚀 OPTIMIZACIÓN: Divide el código en pedazos inteligentes
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // Separa Firebase (es pesado y cambia poco)
                        if (id.includes('firebase')) {
                            return 'firebase';
                        }
                        // Separa React y Router (núcleo estable)
                        if (id.includes('react') || id.includes('remix') || id.includes('router')) {
                            return 'react-vendor';
                        }
                        // El resto de librerías
                        return 'vendor';
                    }
                }
            }
        },
        // Aumenta el límite de advertencia de tamaño de chunk (opcional, para que no moleste en consola)
        chunkSizeWarningLimit: 1000,
    }
});
