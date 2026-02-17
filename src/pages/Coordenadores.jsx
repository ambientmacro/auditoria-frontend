/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";

export default function Coordenadores() {
  const [coordenadores, setCoordenadores] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState("");

  const { token } = useContext(AuthContext);

  const usuarioLogado = token
    ? JSON.parse(atob(token.split(".")[1]))
    : null;

  const isAdmin = usuarioLogado?.tipo === "ADMIN";

  async function carregar() {
    try {
      const response = await api.get("/coordenadores");
      setCoordenadores(response.data);
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
    setNome("");
    setModalOpen(true);
  }

  function abrirEditar(coord) {
    setEditando(coord);
    setNome(coord.nome);
    setModalOpen(true);
  }

  async function salvar() {
    try {
      if (!nome.trim()) return;

      if (editando) {
        await api.put(`/coordenadores/${editando.id}`, { nome });
      } else {
        await api.post("/coordenadores", { nome });
      }

      setModalOpen(false);
      carregar();
    } catch (err) {
      console.error(err);
    }
  }

  async function deletar(id) {
    if (!window.confirm("Deseja deletar este coordenador?")) return;

    try {
      await api.delete(`/coordenadores/${id}`);
      carregar();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Layout>
      <h1 style={{ color: "#0047AB", marginBottom: "20px" }}>
        Gestão de Coordenadores
      </h1>

      {isAdmin && (
        <button style={btnNovo} onClick={abrirNovo}>
          + Novo Coordenador
        </button>
      )}

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
          <th style={th}>Nome</th>
          {isAdmin && (
            <th style={{ ...th, textAlign: "center" }}>
              Ações
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {coordenadores.map((coord) => (
          <tr key={coord.id}>
            <td style={td}>{coord.nome}</td>

            {isAdmin && (
              <td
                style={{
                  ...td,
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px"
                }}
              >
                <button
                  style={btnEditar}
                  onClick={() => abrirEditar(coord)}
                >
                  ✏ Editar
                </button>

                <button
                  style={btnExcluir}
                  onClick={() => deletar(coord.id)}
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
            {editando ? "Editar Coordenador" : "Novo Coordenador"}
          </h2>

          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={input}
          />

          <button style={btnSalvar} onClick={salvar}>
            Salvar
          </button>
        </Modal>
      )}
    </Layout>
  );
}

/* ================= ESTILOS ================= */

const cardTabela = {
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  height: "calc(100vh - 220px)", // controla altura
  overflow: "hidden",
  display: "flex",
  flexDirection: "column"
};

const tabela = {
  width: "100%",
  maxWidth: "100%", // 🔥 evita quebrar no mobile
  borderCollapse: "collapse"
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

const linha = {
  transition: "0.2s"
};

const scrollContainer = {
  maxHeight: "450px",
  overflowY: "auto",
  overflowX: "auto", // 🔥 ESSENCIAL PARA CELULAR
};

const btnNovo = {
  marginBottom: "20px",
  width: "fit-content",
  marginLeft: "auto",
  padding: "10px 20px",
  background: "#0047AB",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px"
};

const btnEditar = {
  background: "#1E8E3E",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer"
};

const btnExcluir = {
  background: "#C62828",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "500",
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
  border: "1px solid #ddd",
  fontSize: "14px"
};


