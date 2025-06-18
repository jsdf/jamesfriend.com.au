import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import mdx from "@mdx-js/rollup";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        include: /\.(mdx|md)$/,
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
});
