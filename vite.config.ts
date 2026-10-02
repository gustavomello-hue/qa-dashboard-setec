import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";

// O projeto não tem @types/node; só o env do processo é usado aqui.
declare const process: { env: Record<string, string | undefined> };

// SHA do commit que o Actions está publicando; fora dele (npm run dev/build local) é "dev",
// e o site não procura versão nova.
const VERSAO = process.env.GITHUB_SHA || "dev";

/** Grava o versao.json ao lado do index.html: as abas abertas comparam com o próprio build. */
function versaoJson(): Plugin {
  return {
    name: "versao-json",
    apply: "build",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "versao.json", source: JSON.stringify({ versao: VERSAO }) });
    },
  };
}

// O Pages serve o site em /qa-dashboard-setec/, não na raiz do domínio.
export default defineConfig({
  base: "/qa-dashboard-setec/",
  plugins: [react(), versaoJson()],
  define: {
    __VERSAO_SITE__: JSON.stringify(VERSAO),
  },
  test: {
    environment: "node",
  },
});
