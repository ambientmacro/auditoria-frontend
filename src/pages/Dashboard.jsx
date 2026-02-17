import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from "recharts";

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);
  const [graficoAtivo, setGraficoAtivo] = useState(1);
  const [activeIndex, setActiveIndex] = useState(null);

  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  async function carregar() {
    const r = await api.get("/registros");
    setRegistros(r.data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, []);

  // ========================
  // FILTRO POR PERÍODO
  // ========================
  const registrosFiltrados = registros.filter(r => {
    if (filtroDataInicio && new Date(r.data_registro) < new Date(filtroDataInicio)) return false;
    if (filtroDataFim && new Date(r.data_registro) > new Date(filtroDataFim)) return false;
    return true;
  });

  // ========================
  // AGRUPAMENTOS
  // ========================
  function agruparPor(campo) {
    const agrupado = {};

    registrosFiltrados.forEach(r => {
      const chave = r[campo] || "Sem Informação";
      agrupado[chave] = (agrupado[chave] || 0) + 1;
    });

    return Object.keys(agrupado).map(k => ({
      nome: k,
      total: agrupado[k]
    }));
  }

  const dadosSubsetor = agruparPor("subsetor_nome");
  const dadosSetor = agruparPor("setor_nome");
  const dadosFuncionario = agruparPor("funcionario_responsavel");

  const totalSubsetor = dadosSubsetor.reduce((acc, item) => acc + item.total, 0);

  // ========================
  // POR PERÍODO
  // ========================
  function agruparPorPeriodo() {
    const agrupado = {};

    registrosFiltrados.forEach(r => {
      const data = new Date(r.data_registro).toLocaleDateString();
      agrupado[data] = (agrupado[data] || 0) + 1;
    });

    return Object.keys(agrupado).map(k => ({
      data: k,
      total: agrupado[k]
    }));
  }

  const dadosPeriodo = agruparPorPeriodo();

  const cores = [
    "#0f50db", "#1E8E3E", "#e70606", "#F59E0B",
    "#6B21A8", "#b9228c", "#c1a4da", "#070101",
    "#2cd3e9", "#ebd40b", "#db24d2", "#a913e4",
    "#d47a7a", "#fd7607"
  ];

  return (
    <Layout>
      <h1 style={{ marginBottom: "20px" }}>Dashboard</h1>

      <div style={filtroContainer}>
        <input
          type="date"
          value={filtroDataInicio}
          onChange={(e) => setFiltroDataInicio(e.target.value)}
        />
        <input
          type="date"
          value={filtroDataFim}
          onChange={(e) => setFiltroDataFim(e.target.value)}
        />
      </div>

      <div style={botoesContainer}>
        <button onClick={() => setGraficoAtivo(1)}>Registros por Subsetor</button>
        <button onClick={() => setGraficoAtivo(2)}>Registros por Setor</button>
        <button onClick={() => setGraficoAtivo(3)}>Registros por Funcionário</button>
        <button onClick={() => setGraficoAtivo(4)}>Registros por Período</button>
      </div>

      <div style={graficoContainer}>

        {/* ================= PIZZA ================= */}
        {graficoAtivo === 1 && (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={dadosSubsetor}
                dataKey="total"
                nameKey="nome"
                 cx={500}
                 cy={200}
                outerRadius={150}
              >
                {dadosSubsetor.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={cores[index % cores.length]}
                    stroke={activeIndex === index ? "#000" : "none"}
                    strokeWidth={activeIndex === index ? 3 : 0}
                    opacity={
                      activeIndex === null
                        ? 1
                        : activeIndex === index
                        ? 1
                        : 0.4
                    }
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                iconSize={14}
                wrapperStyle={{
                  fontSize: "18px",
                  cursor: "pointer"
                }}
                formatter={(value, entry, index) => {
                  const porcentagem = totalSubsetor > 0
                    ? ((entry.payload.total / totalSubsetor) * 100).toFixed(1)
                    : 0;

                     // eslint-disable-next-line no-unused-vars
                     const ativo = activeIndex === index;

                  return (
                    <span
                      style={{
                        display: "inline-block",
          width: "400px", // 👈 largura fixa evita tremor
          color: ativo ? "#000" : "#111010",
          opacity: ativo ? 1 : 0.7,
          transition: "opacity 0.2s ease"
                         }}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
      >
        {value} – {entry.payload.total} ({porcentagem}%)
      </span>
    );
  }}
/>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* ================= BARRA SETOR ================= */}
        {graficoAtivo === 2 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosSetor} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" />
              <Tooltip />
              <Bar dataKey="total" fill="#8e13be" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* ================= BARRA FUNCIONÁRIO ================= */}
        {graficoAtivo === 3 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosFuncionario} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" />
              <Tooltip />
              <Bar dataKey="total" fill="#1E8E3E" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* ================= LINHA PERÍODO ================= */}
        {graficoAtivo === 4 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dadosPeriodo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#C62828" />
            </LineChart>
          </ResponsiveContainer>
        )}

      </div>
    </Layout>
  );
}

const filtroContainer = {
  display: "flex",
  gap: "30px",
  marginBottom: "20px"
};

const botoesContainer = {
  display: "flex",
  gap: "15px",
  marginBottom: "30px"
};

const graficoContainer = {
  padding: "20px 0"
};
