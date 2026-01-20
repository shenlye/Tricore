import antfu from "@antfu/eslint-config";

export default antfu({
  react: true,
  typescript: true,
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: true,
  },
  ignores: [
    "**/dist/**",
    "**/node_modules/**",
    "**/build/**",
    "**/coverage/**",
    "src/components/ui/**",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "no-console": "warn",
  },
});
