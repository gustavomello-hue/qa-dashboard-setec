// npm run dados:local
//
// Copia o dashboard.json mais recente gerado nesta máquina para
// public/dados-local.json, que é o que o `npm run dev` lê. O arquivo está no
// .gitignore: os dados publicados moram no branch `dados`, não na main.
//
// Para gerar um JSON novo sem publicar nada:
//   ..\scripts\publicar_dashboard.bat --sem-push --forcar
import { copyFileSync, existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origem = resolve(raiz, "..", "scripts", ".publicacao", "dashboard.json");
const destino = resolve(raiz, "public", "dados-local.json");

if (!existsSync(origem)) {
  console.error(`Não achei ${origem}.`);
  console.error("Gere com: ..\\scripts\\publicar_dashboard.bat --sem-push --forcar");
  process.exit(1);
}
copyFileSync(origem, destino);
console.log(`Copiado (${(statSync(destino).size / 1e6).toFixed(1)} MB): ${destino}`);
