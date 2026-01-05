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
                        // Core React libraries - very stable, separate to cache effectively
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('remix')) {
                            return 'react-vendor';
                        }
                        // Firebase - huge library, keep isolated
                        if (id.includes('firebase') || id.includes('@firebase')) {
                            return 'firebase';
                        }
                        // Lucide icons - often large if not tree-shaken well, giving it room
                        if (id.includes('lucide')) {
                            return 'ui-icons';
                        }
                        // Everything else
                        return 'vendor';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
});
