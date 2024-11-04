import Terminal from "vite-plugin-terminal";

export default {
  plugins: [
    Terminal({
      output: ["terminal", "console"],
    }),
  ],
};
