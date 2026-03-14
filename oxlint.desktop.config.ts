import nkzw from "@nkzw/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  env: {
    node: true,
  },
  extends: [nkzw],
  rules: {
    "no-empty-pattern": "off",
    "react-hooks/rules-of-hooks": "off",
  },
});
