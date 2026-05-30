export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "body-min-lines": ({ body }) => {
          const lines = (body || "").split("\n").filter((line) => line.trim() !== "");
          return [lines.length >= 1, "body must have at least 1 non-empty line"];
        },
      },
    },
  ],
  rules: {
    "subject-empty": [2, "never"],
    "body-empty": [2, "never"],
    "body-min-lines": [2, "always"],
  },
};
