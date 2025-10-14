import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import uiConfig from '@testopilo/ui/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  ...uiConfig,
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};
