import antfu from "@antfu/eslint-config";

export default antfu({
  react: true,
  nextjs: true,
  typescript: true,
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: true,
  },
  rules: {
    "react/no-implicit-key": "off",
    "no-console": "off",
  },
});
