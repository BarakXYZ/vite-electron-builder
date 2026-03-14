import nkzw from "@nkzw/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [nkzw],
  rules: {
    "no-empty-pattern": "off",
    "react-hooks/rules-of-hooks": "off",
  },
});
