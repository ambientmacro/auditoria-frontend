import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";

export default function Subsetores() {
  const [subsetores, setSubsetores] = useState([]);
  const [setores, setSetores] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);

  const [filtroCoord, setFiltroCoord] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    setor_id: ""
  });

  const { token } = useContext(AuthContext);

  const usuarioLogado = token
    ? JSON.parse(atob(token.split(".")[1]))
    : null;

  const isAdmin = usuarioLogado?.tipo === "ADMIN";

  async function carregar() {
    const ss = await api.get("/subsetores");
    const s = await api.get("/setores");
    const c = await api.get("/coordenadores");

    setSubsetores(ss.data);
    setSetores(s.data);
    setCoordenadores(c.data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setForm({ nome: "", setor_id: "" });
    setModalOpen(true);
  }

  function abrirEditar(item) {
    setEditando(item);
    setForm({
      nome: item.nome,
      setor_id: item.setor_id
    });
    setModalOpen(true);
  }

  async function salvar() {
    if (!form.nome.trim()) return;

    if (editando) {
      await api.put(`/subsetores/${editando.id}`, form);
    } else {
      await api.post("/subsetores", form);
    }

    setModalOpen(false);
    carregar();
  }

  async function deletar(id) {
    if (!window.confirm("Deseja deletar este subsetor?")) return;
    await api.delete(`/subsetores/${id}`);
    carregar();
  }

  const subsetoresFiltrados = subsetores.filter((ss) => {
    if (filtroCoord && ss.coordenador_id !== filtroCoord) return false;
    if (filtroSetor && ss.setor_id !== filtroSetor) return false;
    return true;
  });

  return (
    <Layout>
      <h1 style={{ color: "#0047AB", marginBottom: "20px" }}>
        Gestão de Subsetores
      </h1>

      {/* FILTROS */}
      <div style={cardFiltro}>
        <select
          value={filtroCoord}
          onChange={(e) => {
            setFiltroCoord(e.target.value);
            setFiltroSetor("");
          }}
        >
          <option value="">Filtrar por Coordenador</option>
          {coordenadores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          value={filtroSetor}
          onChange={(e) => setFiltroSetor(e.target.value)}
        >
          <option value="">Filtrar por Setor</option>
          {setores
            .filter((s) => !filtroCoord || s.coordenador_id === filtroCoord)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
        </select>

        {isAdmin && (
          <button style={btnNovo} onClick={abrirNovo}>
            + Novo Subsetor
          </button>
        )}
      </div>

      {/* TABELA */}
      <div style={cardTabela}>
        <div style={scrollContainer}>
          <table style={tabela}>
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "white",
                zIndex: 1
              }}
            >
              <tr>
                <th style={{ ...th, width: "200px" }}>Subsetor</th>
                <th style={{ ...th, width: "200px" }}>Setor</th>
                <th style={{ ...th, width: "200px" }}>Coordenador</th>
                {isAdmin && (
                  <th style={{ ...th, width: "120px" }}>Ações</th>
                )}
              </tr>
            </thead>

            <tbody>
              {subsetoresFiltrados.map((ss) => (
                <tr key={ss.id}>
                  <td style={td}>{ss.nome}</td>
                  <td style={td}>{ss.setor_nome}</td>
                  <td style={td}>{ss.coordenador_nome}</td>

                  {isAdmin && (
                    <><td style={acoesTd}>
                      <button
                        style={btnEditar}
                        onClick={() => abrirEditar(ss)}
                      >
                        ✏ Editar
                      </button>

                      <button
                        style={btnExcluir}
                        onClick={() => deletar(ss.id)}
                      >
                        🗑 Deletar
                      </button>
                    </td></>
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
            {editando ? "Editar Subsetor" : "Novo Subsetor"}
          </h2>

          <input
            placeholder="Nome do subsetor"
            value={form.nome}
            onChange={(e) =>
              setForm({ ...form, nome: e.target.value })
            }
            style={input}
          />

          <select
            value={form.setor_id}
            onChange={(e) =>
              setForm({ ...form, setor_id: e.target.value })
            }
            style={{ ...input, marginTop: "10px" }}
          >
            <option value="">Selecione o setor</option>
            {setores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
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

/* ================= ESTILOS ================= */
const cardFiltro = {
  display: "flex",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "20px"
};

const cardTabela = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  overflow: "hidden",
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

const th = {
  padding: "14px",
  borderBottom: "2px solid #e5e7eb",
  borderRight: "1px solid #e5e7eb",
  fontWeight: "800",
  textAlign: "left",
  fontSize: "14px"
};

const td = {
  padding: "16px",
  borderBottom: "1px solid #f1f1f1",
  borderRight: "1px solid #f1f1f1",
  whiteSpace: "normal",
  wordBreak: "break-word",
  fontSize: "14px"
};

const acoesTd = {
  ...td,
  display: "flex",
  justifyContent: "center",
  gap: "10px"
};


const btnNovo = {
  padding: "10px 18px",
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
  marginTop: "3px",
  padding: "8px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
};

const btnExcluir = {
  background: "#C62828",
  color: "white",
  border: "none",
  marginTop: "3px",
  padding: "8px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
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
  border: "1px solid #ddd",
  fontSize: "14px"
};
