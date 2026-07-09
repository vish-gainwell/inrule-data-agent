// postcss.config.js (Tailwind 4 compatible)
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
    plugins: [
        tailwindcss(),
        autoprefixer(),
    ],
};
