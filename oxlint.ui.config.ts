import nkzw from "@nkzw/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [nkzw],
  rules: {
    "@typescript-eslint/array-type": "off",
    "import/no-namespace": "off",
    "perfectionist/sort-jsx-props": "off",
    "perfectionist/sort-object-types": "off",
    "perfectionist/sort-objects": "off",
  },
});
