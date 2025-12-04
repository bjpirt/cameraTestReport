import * as esbuild from "esbuild";
import { readFile } from "node:fs/promises";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const postcssPlugin = {
  name: "postcss",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await readFile(args.path, "utf8");
      const result = await postcss([tailwindcss]).process(css, {
        from: args.path,
      });
      return { contents: result.css, loader: "css" };
    });
  },
};

const isServe = process.argv.includes("--serve");

const buildOptions = {
  entryPoints: ["src/index.tsx", "src/styles.css"],
  bundle: true,
  outdir: "public/dist",
  plugins: [postcssPlugin],
};

if (isServe) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.serve({
    servedir: "public",
    port: 8000,
  });
  console.log("Server running at http://localhost:8000");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete");
}
