// Decifragem do dashboard.json no navegador (PLANO-BASE-DADOS.md, etapa 3).
//
// O publicador (scripts/cifra_dados.py) envia o JSON cifrado: o branch `dados`
// é público, e uma senha só na tela não protegeria o arquivo. Aqui se faz a
// conta inversa: PBKDF2-SHA256 → AES-256-GCM → gunzip. Se um lado mudar, o
// outro muda junto e o FORMATO ganha um número novo.

export const FORMATO = "qa-cifrado-1";

export interface Envelope {
  cifrado: string;
  kdf: { nome: string; iteracoes: number; sal: string };
  iv: string;
  dados: string;
}

/** Senha ausente ou que não abre mais os dados (senha trocada). */
export class ErroSenha extends Error {}

export function ehEnvelope(x: unknown): x is Envelope {
  return typeof x === "object" && x !== null && "cifrado" in x;
}

function deBase64(texto: string): Uint8Array<ArrayBuffer> {
  const bin = atob(texto);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function paraBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** Chave AES a partir da senha. Leva ~1 s de propósito (600 mil iterações). */
export async function derivarChave(senha: string, kdf: Envelope["kdf"]): Promise<CryptoKey> {
  if (kdf.nome !== "PBKDF2-SHA256") throw new Error(`Derivação desconhecida: ${kdf.nome}`);
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: deBase64(kdf.sal), iterations: kdf.iteracoes },
    base,
    { name: "AES-GCM", length: 256 },
    true, // exportável: é o que o "lembrar neste dispositivo" guarda
    ["decrypt"],
  );
}

/** Envelope → objeto JSON. Chave errada vira ErroSenha (o GCM autentica). */
export async function decifrar(envelope: Envelope, chave: CryptoKey): Promise<unknown> {
  if (envelope.cifrado !== FORMATO) {
    throw new Error(`Os dados vêm cifrados no formato ${envelope.cifrado}, que este site não conhece. Recarregue a página.`);
  }
  let compacto: ArrayBuffer;
  try {
    compacto = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: deBase64(envelope.iv), additionalData: new TextEncoder().encode(FORMATO) },
      chave,
      deBase64(envelope.dados),
    );
  } catch {
    throw new ErroSenha("A senha não abre estes dados.");
  }
  const texto = await new Response(new Blob([compacto]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
  return JSON.parse(texto);
}

export async function exportarChave(chave: CryptoKey): Promise<string> {
  return paraBase64(new Uint8Array(await crypto.subtle.exportKey("raw", chave)));
}

export async function importarChave(texto: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", deBase64(texto), { name: "AES-GCM" }, true, ["decrypt"]);
}
