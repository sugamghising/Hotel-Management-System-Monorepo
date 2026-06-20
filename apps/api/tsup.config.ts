import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: 'esm',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false,
  noExternal: ['@hms/schemas', '@hms/types'],
  target: 'node20',
  platform: 'node',
  bundle: true,
  splitting: false,
});
