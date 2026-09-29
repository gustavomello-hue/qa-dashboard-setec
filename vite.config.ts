import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// O Pages serve o site em /qa-dashboard-setec/, não na raiz do domínio.
export default defineConfig({
  base: "/qa-dashboard-setec/",
  plugins: [react()],
  test: {
    environment: "node",
  },
});
