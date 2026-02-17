import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        usuario,
        senha,
      });

      setToken(response.data.token);
      navigate("/dashboard");

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Usuário ou senha inválidos");
    }
  }

  return (
    <div style={{
       display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to bottom, #07335a, #69cfd4)", // 👈 aqui muda o fundo
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          width: "350px",
        }}
      >
        <h2 style={{ marginBottom: "20px", marginLeft: "15px", color: "#0047AB" }}>
          Sistema de Auditoria
        </h2>

        <input
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />
         
        <input
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <button
          style={{
            width: "100%",
            padding: "10px",
            background: "#0047AB",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
