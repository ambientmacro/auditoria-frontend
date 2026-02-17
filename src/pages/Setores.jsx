import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";

export default function Setores() {
  const [setores, setSetores] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);
  const [filtroCoord, setFiltroCoord] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    coordenador_id: ""
  });

  const { token } = useContext(AuthContext);
  const usuarioLogado = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const isAdmin = usuarioLogado?.tipo === "ADMIN";

  async function carregar() {
    try {
      const s = await api.get("/setores");
      const c = await api.get("/coordenadores");

      setSetores(s.data);
      setCoordenadores(c.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setForm({ nome: "", coordenador_id: "" });
    setModalOpen(true);
  }

  function abrirEditar(setor) {
    setEditando(setor);
    setForm({
      nome: setor.nome,
      coordenador_id: setor.coordenador_id
    });
    setModalOpen(true);
  }

  async function salvar() {
    try {
      if (!form.nome || !form.coordenador_id) {
        alert("Preencha todos os campos");
        return;
      }

      if (editando) {
        await api.put(`/setores/${editando.id}`, form);
      } else {
        await api.post("/setores", form);
      }

      setModalOpen(false);
      setEditando(null);
      setForm({ nome: "", coordenador_id: "" });
      carregar();

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar");
    }
  }

  async function deletar(id) {
    if (!window.confirm("Deseja deletar este setor?")) return;

    try {
      await api.delete(`/setores/${id}`);
      carregar();
    } catch (err) {
      console.error(err);
    }
  }

  const setoresFiltrados = setores.filter((s) => {
    if (filtroCoord && s.coordenador_id !== filtroCoord) return false;
    return true;
  });

  return (
    <Layout>
      <h1 style={{ color: "#0047AB", marginBottom: "20px" }}>
        Gestão de Setores
      </h1>

      {/* FILTRO + BOTÃO */}
      <div style={cardFiltro}>
        <select
          value={filtroCoord}
          onChange={(e) => setFiltroCoord(e.target.value)}
          style={select}
        >
          <option value="">Filtrar por Coordenador</option>
          {coordenadores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        {isAdmin && (
          <button style={btnNovo} onClick={abrirNovo}>
            + Novo Setor
          </button>
        )}
      </div>

      {/* TABELA */}
      <div style={cardTabela}>
        <div style={scrollContainer}>
          <table style={tabela}>
            <thead style={thead}>
              <tr>
                <th style={th}>Nome</th>
                <th style={th}>Coordenador</th>
                {isAdmin && (
                  <th style={{ ...th, textAlign: "center" }}>Ações</th>
                )}
              </tr>
            </thead>

            <tbody>
              {setoresFiltrados.map((setor) => (
                <tr key={setor.id}>
                  <td style={td}>{setor.nome}</td>
                  <td style={td}>{setor.coordenador_nome}</td>

                  {isAdmin && (
                    <td style={acoesTd}>
                      <button
                        style={btnEditar}
                        onClick={() => abrirEditar(setor)}
                      >
                        ✏ Editar
                      </button>

                      <button
                        style={btnExcluir}
                        onClick={() => deletar(setor.id)}
                      >
                        🗑 Deletar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h2 style={{ marginBottom: "15px" }}>
            {editando ? "Editar Setor" : "Novo Setor"}
          </h2>

          <input
            placeholder="Nome"
            value={form.nome}
            onChange={(e) =>
              setForm({ ...form, nome: e.target.value })
            }
            style={input}
          />

          <select
            value={form.coordenador_id}
            onChange={(e) =>
              setForm({ ...form, coordenador_id: e.target.value })
            }
            style={{ ...input, marginTop: "10px" }}
          >
            <option value="">Selecione o coordenador</option>
            {coordenadores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <button style={btnSalvar} onClick={salvar}>
            Salvar
          </button>
        </Modal>
      )}
    </Layout>
  );
}

/* ===== ESTILOS ===== */

const cardFiltro = {
  display: "flex",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "20px"
};

const select = {
  padding: "8px 12px",
  borderRadius: "0px",
  border: "0px solid #0a0a0a"
};

const cardTabela = {
  background: "white",
  borderRadius: "12px",
  padding: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};

const scrollContainer = {
  maxHeight: "450px",
  overflowY: "auto",
  overflowX: "auto", // 🔥 ESSENCIAL PARA CELULAR
};

const tabela = {
  width: "100%",
  maxWidth: "100%", // 🔥 evita quebrar no mobile
  borderCollapse: "collapse"
};

const thead = {
  position: "sticky",
  top: 0,
  background: "white",
  zIndex: 1
};

const th = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "2px solid #aa9d9dfb",
  fontWeight: "800"
};

const td = {
  padding: "16px",
  borderBottom: "1px solid #e4e0e0",
  borderRight: "1px solid #f0eded",
  whiteSpace: "normal",
  wordBreak: "break-word",
  fontSize: "14px",
};

const acoesTd = {
  ...td,
  display: "flex",
  justifyContent: "center",
  gap: "10px"
};

const btnNovo = {
  padding: "10px 20px",
  background: "#0047AB",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer"
};

const btnEditar = {
  background: "#1E8E3E",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer"
};

const btnExcluir = {
  background: "#C62828",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer"
};

const btnSalvar = {
  marginTop: "15px",
  padding: "10px",
  background: "#0047AB",
  color: "white",
  border: "none",
  borderRadius: "8px",
  width: "100%",
  fontWeight: "600",
  cursor: "pointer"
};

const input = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #dddddd",
  fontSize: "14px"
};
