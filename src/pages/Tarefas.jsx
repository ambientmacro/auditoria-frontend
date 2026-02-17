/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";

export default function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);
  const [setores, setSetores] = useState([]);
  const [subsetores, setSubsetores] = useState([]);
   
  
  const [filtroCoord, setFiltroCoord] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalRegistro, setModalRegistro] = useState(false);

  const [editando, setEditando] = useState(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    subsetor_id: "",
    nivel_importancia: "BAIXO",
    porcentagem: 0
  });

  const [registroForm, setRegistroForm] = useState({
    funcionario_responsavel: "",
    descricao: ""
  });
  const [funcionarios, setFuncionarios] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  
  const { token } = useContext(AuthContext);
  const usuarioLogado = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const isAdmin = usuarioLogado?.tipo === "ADMIN";

  async function resetarConcluidas() {
  const tarefasParaResetar = tarefasFiltradas
    .filter(t => t.status === "CONCLUIDO");

  if (tarefasParaResetar.length === 0) {
    alert("Nenhuma tarefa concluída para resetar.");
    return;
  }

  if (!window.confirm("Deseja resetar as tarefas concluídas exibidas?")) return;

  try {
    for (let tarefa of tarefasParaResetar) {
      await api.put(`/tarefas/${tarefa.id}/status`, {
        status: "PENDENTE"
      });
    }

    carregar();
  } catch (err) {
    console.error(err);
    alert("Erro ao resetar tarefas.");
  }
}


  async function carregar() {
    const t = await api.get("/tarefas");
    const c = await api.get("/coordenadores");
    const s = await api.get("/setores");
    const ss = await api.get("/subsetores");

    setTarefas(t.data);
    setCoordenadores(c.data);
    setSetores(s.data);
    setSubsetores(ss.data);
  }

  useEffect(() => {
    
    carregar();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setForm({
      nome: "",
      subsetor_id: "",
      nivel_importancia: "BAIXO",
      porcentagem: 0
    });
    setModalOpen(true);
  }

  function abrirEditar(tarefa) {
    setEditando(tarefa);
    setForm({
      nome: tarefa.nome,
      subsetor_id: tarefa.subsetor_id,
      nivel_importancia: tarefa.nivel_importancia,
      porcentagem: tarefa.porcentagem
    });
    setModalOpen(true);
  }

  async function salvar() {
    try {
      if (!form.nome.trim()) {
        alert("Preencha o nome da tarefa");
        return;
      }

      if (editando) {
        await api.put(`/tarefas/${editando.id}`, form);
      } else {
        await api.post("/tarefas", form);
      }

      setModalOpen(false);
      setEditando(null);
      carregar();
    } catch (err) {
      alert("Erro ao salvar tarefa");
    }
  }

  async function deletar(id) {
  if (!window.confirm("Deseja deletar esta tarefa?")) return;

  try {
    const response = await api.delete(`/tarefas/${id}`);
    console.log("SUCESSO:", response.data);
    carregar();
  } catch (err) {
    console.log("ERRO COMPLETO:", err);
    console.log("ERRO RESPONSE:", err.response);
    alert("Erro ao deletar tarefa");
  }
}


  async function mudarStatus(tarefa) {
    if (!isAdmin) return;

    const novoStatus =
      tarefa.status === "CONCLUIDO" ? "PENDENTE" : "CONCLUIDO";

    await api.put(`/tarefas/${tarefa.id}/status`, {
      status: novoStatus
    });

    carregar();
  }

  async function registrarTarefa() {
    if (!isAdmin) return;

    await api.post("/tarefas/check", {
      tarefa_id: tarefaSelecionada.id,
      funcionario_responsavel: registroForm.funcionario_responsavel,
      descricao: registroForm.descricao
    });

    setModalRegistro(false);
    setRegistroForm({ funcionario_responsavel: "", descricao: "" });
    carregar();
  }

  const tarefasFiltradas = tarefas.filter((t) => {
    if (filtroCoord && t.coordenador_id !== filtroCoord) return false;
    if (filtroSetor && t.setor_id !== filtroSetor) return false;
    return true;
  });

  return (
    <Layout>
      <h1 style={{ color: "#0047AB", marginBottom: "20px" }}>
        Agenda Tarefas
      </h1>

      <div style={cardFiltro}>
        <select value={filtroCoord} onChange={(e) => setFiltroCoord(e.target.value)}>
          <option value="">Filtrar por Coordenador</option>
          {coordenadores.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)}>
          <option value="">Filtrar por Setor</option>
          {setores.map((s) => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>

        {isAdmin && (
          <button style={btnNovo} onClick={abrirNovo}>
            + Nova Tarefa
          </button>
        )}
      </div>
      {isAdmin && (
  <div style={{ marginTop: "10px", textAlign: "right" }}>
    <button
      onClick={resetarConcluidas}
      style={{
        padding: "10px 18px",
        background: "#f59e0b",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: "pointer"
      }}
    >
      Resetar tarefas concluídas
    </button>
  </div>
)}
      <div style={cardTabela}>
        
        <div style={scrollContainer}>
          
          <table style={tabela}>
            
            <thead style={thead}>
              <tr>
                <th style={{ ...th, width: "300px" }}>Tarefa</th>
                <th style={{ ...th, width: "240px" }}>Subsetor</th>
                <th style={{ ...th, width: "190px" }}>Setor</th>
                <th style={{ ...th, width: "200px" }}>Coordenador</th>
                <th style={{ ...th, width: "100px" }}>Nível</th>
                <th style={{ ...th, width: "100px" }}>%</th>
                <th style={{ ...th, width: "140px" }}>Status</th>
                {isAdmin && (
                  <th style={{ ...th, width: "230px" }}>Ações</th>
                )}
              </tr>
            </thead>

            <tbody>
              {tarefasFiltradas.map((t) => (
                <tr key={t.id}>
                  <td style={td}>{t.nome}</td>
                  <td style={td}>{t.subsetor_nome}</td>
                  <td style={td}>{t.setor_nome}</td>
                  <td style={td}>{t.coordenador_nome}</td>
                  <td style={td}>{t.nivel_importancia}</td>
                  <td style={td}>{t.porcentagem}%</td>

                  <td style={td}>
                    <button
                      onClick={() => mudarStatus(t)}
                      style={{
                        ...btnStatus,
                        backgroundColor:
                          t.status === "CONCLUIDO" ? "#1E8E3E" : "#C62828",
                        cursor: isAdmin ? "pointer" : "default",
                        opacity: isAdmin ? 1 : 0.7
                      }}
                    >
                      {t.status}
                    </button>
                  </td>

                  {isAdmin && (
                    <td style={acoesTd}>
                      <button
                        style={btnRegistrar}
                        onClick={() => {
                          setTarefaSelecionada(t);
                          setModalRegistro(true);
                        }}
                      >
                        Registrar
                      </button>

                      <button
                        style={btnEditar}
                        onClick={() => abrirEditar(t)}
                      >
                        Editar
                      </button>

                      <button
                        style={btnExcluir}
                        onClick={() => deletar(t.id)}
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
      {editando ? "Editar Tarefa" : "Nova Tarefa"}
    </h2>

    <div style={formContainer}>
      <input
        placeholder="Nome da tarefa"
        value={form.nome}
        onChange={(e) => setForm({ ...form, nome: e.target.value })}
        style={inputFull}
      />

      <select
        value={form.subsetor_id}
        onChange={(e) =>
          setForm({ ...form, subsetor_id: e.target.value })
        }
        style={inputFull}
      >
        <option value="">Selecione o subsetor</option>
        {subsetores.map((ss) => (
          <option key={ss.id} value={ss.id}>
            {ss.nome}
          </option>
        ))}
      </select>

      <div style={linhaFlex}>
        <select
          value={form.nivel_importancia}
          onChange={(e) =>
            setForm({ ...form, nivel_importancia: e.target.value })
          }
          style={inputPequeno}
        >
          <option value="BAIXO">BAIXO</option>
          <option value="MEDIO">MÉDIO</option>
          <option value="ALTO">ALTO</option>
        </select>

        <input
          type="number"
          placeholder="Porcentagem"
          value={form.porcentagem}
          onChange={(e) =>
            setForm({ ...form, porcentagem: e.target.value })
          }
          style={inputPequeno}
        />
      </div>

      <button style={btnSalvar} onClick={salvar}>
        Salvar
      </button>
    </div>
  </Modal>
)}

{/* 🔥 AGORA FORA DO PRIMEIRO MODAL 🔥 */}
{modalRegistro && (
  <Modal onClose={() => setModalRegistro(false)}>
    <h2>Registrar Tarefa</h2>

    <div style={formContainer}>
      <input
        placeholder="Funcionário responsável"
        value={registroForm.funcionario_responsavel}
        onChange={(e) =>
          setRegistroForm({
            ...registroForm,
            funcionario_responsavel: e.target.value
          })
        }
        style={inputFull}
      />

      <textarea
        placeholder="Descrição"
        value={registroForm.descricao}
        onChange={(e) =>
          setRegistroForm({
            ...registroForm,
            descricao: e.target.value
          })
        }
        style={{
          ...inputFull,
          minHeight: "80px"
        }}
      />

      <button style={btnSalvar} onClick={registrarTarefa}>
        Confirmar Registro
      </button>
    </div>
  </Modal>
)}


    </Layout>
  );
}

/* ================= ESTILOS ================= */

const cardFiltro = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "20px",
};


const cardTabela = {
  background: "transparent",
  padding: "0px",
  boxShadow: "none"
};

const scrollContainer = {
  maxHeight: "450px",
  overflowY: "auto",
  overflowX: "auto", // 🔥 ESSENCIAL PARA CELULAR
  borderRadius: "18px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  borderTopLeftRadius: "12px",
  borderTopRightRadius: "12px",
  borderBottomLeftRadius: "12px",
  borderBottomRightRadius: "12px",
};

const tabela = {
  minWidth: "1000px",
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0",
  tableLayout: "fixed",
};

const thead = {
  position: "sticky",
  top: 0,
  background: "white",
  zIndex: 1
};

const th = {
  textAlign: "left",
  padding: "12px 40px",
  borderBottom: "2px solid #aa9d9dfb",
  fontWeight: "800",
  background: "#fff",
};

const td = {
  padding: "16px",
  borderBottom: "1px solid #e4e0e0",
  borderRight: "1px solid #dad0d0",
  whiteSpace: "normal",
  wordBreak: "break-word",
  fontSize: "14px",
  background: "#fff",
};

const acoesTd = {
  padding: "16px 20px",
  borderBottom: "1px solid #d3cbcb",
  textAlign: "center",
  whiteSpace: "nowrap"
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

const btnRegistrar = {
  background: "#C62828",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer"
};

const btnEditar = {
  background: "#1E8E3E",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  margin: "0 4px"
};

const btnExcluir = {
  background: "#B71C1C",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer"
};

const btnSalvar = {
  marginTop: "15px",
  padding: "10px",
  background: "#102eaf",
  color: "white",
  border: "none",
  borderRadius: "6px"
};

const btnStatus = {
  padding: "6px 12px",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};

const formContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  width: "100%",
  maxWidth: "500px"
};

const linhaFlex = {
  display: "flex",
  gap: "15px",
  width: "100%"
};

const inputFull = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box"
};

const inputPequeno = {
  flex: 1,
  minWidth: 0,
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box"
};
