import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    usuario: "",
    senha: "",
    tipo: "PADRAO"
  });

  const { token } = useContext(AuthContext);
  const usuarioLogado = JSON.parse(atob(token.split(".")[1]));
  const isAdmin = usuarioLogado.tipo === "ADMIN";

  async function carregarUsuarios() {
    const response = await api.get("/usuarios");
    setUsuarios(response.data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarUsuarios();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setForm({ nome: "", usuario: "", senha: "", tipo: "PADRAO" });
    setModalOpen(true);
  }

  function abrirEditar(user) {
    setEditando(user);
    setForm({ ...user, senha: "" });
    setModalOpen(true);
  }

  async function salvar() {
    try {
      if (!form.nome.trim()) {
        alert("Preencha o nome");
        return;
      }

      if (editando) {
        await api.put(`/usuarios/${editando.id}`, {
          nome: form.nome,
          tipo: form.tipo
        });
      } else {
        await api.post("/usuarios", form);
      }

      setModalOpen(false);
      setEditando(null);
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar usuário");
    }
  }

  async function deletar(id) {
    if (!window.confirm("Deseja deletar este usuário?")) return;
    await api.delete(`/usuarios/${id}`);
    carregarUsuarios();
  }

  return (
    <Layout>
      <h1 style={{ color: "#0047AB", marginBottom: "20px" }}>
        Gestão de Usuários
      </h1>

      {isAdmin && (
        <button style={btnNovo} onClick={abrirNovo}>
          + Novo Usuário
        </button>
      )}

      <div style={cardTabela}>
        <div className="table-responsive" style={scrollContainer}>
          <table style={tabela}>
            <thead style={thead}>
              <tr>
                <th style={th}>Nome</th>
                <th style={th}>Usuário</th>
                <th style={th}>Tipo</th>
                {isAdmin && (
                  <th style={{ ...th, textAlign: "center" }}>Ações</th>
                )}
              </tr>
            </thead>

            <tbody>
              {usuarios.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? "#ffffff" : "#f9fafb"
                  }}
                >
                  <td style={td}>{user.nome}</td>
                  <td style={td}>{user.usuario}</td>

                  <td style={td}>
                    <span
                      style={
                        user.tipo === "ADMIN"
                          ? badgeAdmin
                          : badgePadrao
                      }
                    >
                      {user.tipo}
                    </span>
                  </td>

                  {isAdmin && (
                    <td style={acoesTd}>
                      <button
                        style={btnEditar}
                        onClick={() => abrirEditar(user)}
                      >
                        Editar
                      </button>

                      <button
                        style={btnExcluir}
                        onClick={() => deletar(user.id)}
                      >
                        Deletar
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
          <h2 style={{ marginBottom: "20px" }}>
            {editando ? "Editar Usuário" : "Novo Usuário"}
          </h2>

          <input
            style={input}
            placeholder="Nome"
            value={form.nome}
            onChange={(e) =>
              setForm({ ...form, nome: e.target.value })
            }
          />

          {!editando && (
            <>
              <input
                style={input}
                placeholder="Usuário"
                value={form.usuario}
                onChange={(e) =>
                  setForm({ ...form, usuario: e.target.value })
                }
              />

              <input
                style={input}
                placeholder="Senha"
                type="password"
                value={form.senha}
                onChange={(e) =>
                  setForm({ ...form, senha: e.target.value })
                }
              />
            </>
          )}

          <select
            style={input}
            value={form.tipo}
            onChange={(e) =>
              setForm({ ...form, tipo: e.target.value })
            }
          >
            <option value="ADMIN">ADMIN</option>
            <option value="PADRAO">PADRÃO</option>
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

const cardTabela = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  overflow: "hidden"
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
  background: "rgb(255, 255, 250)",
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
  gap: "10px",
  justifyContent: "center"
};

const btnNovo = {
  marginBottom: "30px",
  padding: "10px 18px",
  background: "#0047AB",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
  width: "150px",
  marginLeft: "1138px"
};

const btnEditar = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
};

const btnExcluir = {
  background: "#dc2626",
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
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px"
};

const badgeAdmin = {
  background: "#dcfce7",
  color: "#166534",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600"
};

const badgePadrao = {
  background: "#e0f2fe",
  color: "#075985",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600"
};
