import { useState, type FormEvent } from "react";

/**
 * Porta do painel: os dados chegam cifrados e só abrem com a senha.
 * "Lembrar neste dispositivo" é o caminho da TV, que não tem quem digite.
 */
export function TelaSenha({ motivo, entrar }: { motivo: string; entrar: (senha: string, lembrar: boolean) => Promise<string | null> }) {
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!senha || ocupado) return;
    setOcupado(true);
    setErro(null);
    const problema = await entrar(senha, lembrar);
    setOcupado(false);
    if (problema) setErro(problema);
  };

  return (
    <main className="tela-inicial">
      <form className="falha porta" onSubmit={enviar} aria-busy={ocupado}>
        <p className="marca"><span className="marca__qa">QA</span> SETEC</p>
        <h1 className="falha__titulo">Painel protegido</h1>
        <p>{motivo}</p>
        <div className="porta__campo">
          <label htmlFor="senha-painel">Senha do painel</label>
          <input
            id="senha-painel"
            className="campo"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            aria-invalid={!!erro}
            aria-describedby={erro ? "senha-erro" : undefined}
          />
          {erro && <p id="senha-erro" className="porta__erro" role="alert">{erro}</p>}
        </div>
        <label className="alternador">
          <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} /> Lembrar neste dispositivo
        </label>
        <button className="botao" type="submit" disabled={!senha || ocupado}>
          {ocupado ? "Abrindo…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
