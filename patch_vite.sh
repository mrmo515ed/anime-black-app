sed -i "1i import { viteSingleFile } from 'vite-plugin-singlefile';" vite.config.ts
sed -i "/tailwindcss(),/a \      viteSingleFile()," vite.config.ts
