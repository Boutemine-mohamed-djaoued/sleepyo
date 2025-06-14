import cleanup from "rollup-plugin-cleanup";
import filesize from "rollup-plugin-filesize";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
export default {
  input: "src/index.js",
  plugins: [commonjs(), nodeResolve(), cleanup()],
  output: [
    {
      file: "dist/sleepyo.js",
      format: "esm",
      plugins: [filesize()],
    },
  ],
};
