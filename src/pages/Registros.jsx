import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";

export default function Registros() {
  const [registros, setRegistros] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);
  const [setores, setSetores] = useState([]);
  const [subsetores, setSubsetores] = useState([]);

  const [filtroCoord, setFiltroCoord] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [filtroSubsetor, setFiltroSubsetor] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroFuncionario, setFiltroFuncionario] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);

  // 🔐 CONTROLE DE PERFIL
  const { token } = useContext(AuthContext);
  const usuarioLogado = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const isAdmin = usuarioLogado?.tipo === "ADMIN";

  async function carregar() {
    const r = await api.get("/registros");
    const c = await api.get("/coordenadores");
    const s = await api.get("/setores");
    const ss = await api.get("/subsetores");

    setRegistros(r.data);
    setCoordenadores(c.data);
    setSetores(s.data);
    setSubsetores(ss.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  const registrosFiltrados = registros.filter((r) => {
    if (filtroCoord && r.coordenador_nome !== filtroCoord) return false;
    if (filtroSetor && r.setor_nome !== filtroSetor) return false;
    if (filtroSubsetor && r.subsetor_nome !== filtroSubsetor) return false;
    if (filtroData && !r.data_registro.startsWith(filtroData)) return false;

    if (
      filtroFuncionario &&
      !r.funcionario_responsavel
        ?.toLowerCase()
        .includes(filtroFuncionario.toLowerCase())
    )
      return false;

    return true;
  });

  async function deletarRegistro(id) {
    if (!window.confirm("Deseja deletar este registro?")) return;
    await api.delete(`/registros/${id}`);
    carregar();
  }

  async function salvarEdicao() {
    await api.put(`/registros/${registroSelecionado.id}`, registroSelecionado);
    setModalOpen(false);
    carregar();
  }

  return (
    <Layout>
      <h1 style={{ color: "#0047AB", marginBottom: "20px" }}>
        Histórico de Registros
      </h1>

      {/* FILTROS */}
      <div style={cardFiltro}>
        <input
          type="text"
          placeholder="Buscar por funcionário"
          value={filtroFuncionario}
          onChange={(e) => setFiltroFuncionario(e.target.value)}
          style={filtroStyle}
        />

        <select
          value={filtroCoord}
          onChange={(e) => setFiltroCoord(e.target.value)}
        >
          <option value="">Coordenação</option>
          {coordenadores.map((c) => (
            <option key={c.id} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          value={filtroSetor}
          onChange={(e) => setFiltroSetor(e.target.value)}
        >
          <option value="">Setor</option>
          {setores.map((s) => (
            <option key={s.id} value={s.nome}>
              {s.nome}
            </option>
          ))}
        </select>

        <select
          value={filtroSubsetor}
          onChange={(e) => setFiltroSubsetor(e.target.value)}
        >
          <option value="">Subsetor</option>
          {subsetores.map((ss) => (
            <option key={ss.id} value={ss.nome}>
              {ss.nome}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div style={cardTabela}>
        <div style={scrollContainer}>
          <table style={tabela}>
            <thead style={thead}>
              <tr>
                <th style={th}>Tarefa</th>
                <th style={th}>Funcionário</th>
                <th style={th}>Coordenação</th>
                <th style={th}>Setor</th>
                <th style={th}>Subsetor</th>
                <th style={thPequeno}>%</th>
                <th style={thDescricao}>Descrição</th>
                <th style={th}>Data</th>
                <th style={th}>Admin</th>

                {isAdmin && (
                  <th style={{ ...th, textAlign: "center" }}>Ações</th>
                )}
              </tr>
            </thead>

            <tbody>
              {registrosFiltrados.map((r, index) => (
                <tr
                  key={r.id}
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                >
                  <td style={td}>{r.tarefa_nome}</td>
                  <td style={td}>{r.funcionario_responsavel}</td>
                  <td style={td}>{r.coordenador_nome}</td>
                  <td style={td}>{r.setor_nome}</td>
                  <td style={td}>{r.subsetor_nome}</td>
                  <td style={tdPequeno}>{r.porcentagem}%</td>
                  <td style={tdDescricao}>{r.descricao}</td>
                  <td style={td}>
                    {new Date(r.data_registro).toLocaleString()}
                  </td>
                  <td style={td}>{r.admin_nome}</td>

                  {isAdmin && (
                    <td style={acoesTd}>
                      <button
                        style={btnEditar}
                        onClick={() => {
                          setRegistroSelecionado(r);
                          setModalOpen(true);
                        }}
                      >
                        Editar
                      </button>

                      <button
                        style={btnExcluir}
                        onClick={() => deletarRegistro(r.id)}
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

      {/* MODAL */}
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h2 style={tituloModal}>Editar Registro</h2>

          <div style={formContainer}>
            <div style={campo}>
              <label style={label}>Funcionário</label>
              <input
                style={input}
                value={registroSelecionado.funcionario_responsavel}
                onChange={(e) =>
                  setRegistroSelecionado({
                    ...registroSelecionado,
                    funcionario_responsavel: e.target.value,
                  })
                }
              />
            </div>

            <div style={campo}>
              <label style={label}>Descrição</label>
              <textarea
                style={textarea}
                value={registroSelecionado.descricao}
                onChange={(e) =>
                  setRegistroSelecionado({
                    ...registroSelecionado,
                    descricao: e.target.value,
                  })
                }
              />
            </div>

            <div style={campo}>
              <label style={label}>Porcentagem</label>
              <input
                type="number"
                style={inputPequeno}
                value={registroSelecionado.porcentagem}
                onChange={(e) =>
                  setRegistroSelecionado({
                    ...registroSelecionado,
                    porcentagem: e.target.value,
                  })
                }
              />
            </div>

            <button style={btnSalvar} onClick={salvarEdicao}>
              Salvar Alterações
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}


/* ===== ESTILOS ===== */

const cardFiltro = {
  display: "flex",
  gap: "30px",
  flexWrap: "wrap",
  marginBottom: "20px",
  padding: "20px",
  borderRadius: "12px"
};

const cardTabela = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  overflow: "hidden"
};

const scrollContainer = {
  maxHeight: "450px",
  overflowY: "auto",
  overflowX: "auto", // 🔥 ESSENCIAL PARA CELULAR
};

const tabela = {
  minWidth: "2200px",
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed"
};


const thead = {
  position: "sticky",
  top: 0,
  background: "#f3f6f8",
  zIndex: 2
};

const th = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "2px solid #aaa6a6fb",
  fontWeight: "800"
};

const thPequeno = { ...th, width: "70px", textAlign: "center" };
const thDescricao = { ...th, width: "400px" };

const td = {
  padding: "16px",
  borderBottom: "1px solid #e4e0e0",
  borderRight: "1px solid #f0eded",
  whiteSpace: "normal",
  wordBreak: "break-word",
  fontSize: "14px",
};

const tdPequeno = { ...td, textAlign: "center" };
const tdDescricao = { ...td, whiteSpace: "normal" };

const acoesTd = {
  ...td,
  textAlign: "center",
  verticalAlign: "middle",
  whiteSpace: "nowrap"
};

const btnEditar = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  margin: "0 6px"
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
  borderRadius: "6px",
  width: "100%"
};

const tituloModal = {
  marginBottom: "25px",
  fontSize: "22px",
  fontWeight: "600"
};

const formContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  width: "100%",
  maxWidth: "500px"
};

const campo = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151"
};

const input = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #e4e9e6",
  fontSize: "14px",
  outline: "none"
};

const textarea = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  minHeight: "90px",
  resize: "vertical",
  outline: "none"
};

const inputPequeno = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #1d4f99",
  fontSize: "14px",
  width: "120px",
  outline: "none"
};
const filtroStyle = {
  padding: "10px 14px",
  borderRadius: "0px",
  border: "1px solid #000000",
  outline: "none"
};