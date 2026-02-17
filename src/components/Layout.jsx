import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./layout.css";

export default function Layout({ children }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <div className="layout">

      {/* BOTÃO HAMBÚRGUER (só aparece no mobile via CSS) */}
      <button 
        className="menu-toggle"
        onClick={() => setMenuAberto(!menuAberto)}
      >
        ☰
      </button>

      <aside className={`sidebar ${menuAberto ? "active" : ""}`}>
        <h2 className="logo">Auditoria</h2>

        <nav>
          <Link to="/dashboard" onClick={fecharMenu}>Dashboard</Link>
          <Link to="/coordenadores" onClick={fecharMenu}>Coordenadores</Link>
          <Link to="/setores" onClick={fecharMenu}>Setores</Link>
          <Link to="/subsetores" onClick={fecharMenu}>Subsetores</Link>
          <Link to="/tarefas" onClick={fecharMenu}>Tarefas</Link>
          <Link to="/registros" onClick={fecharMenu}>Registros</Link>
          <Link to="/configuracoes" onClick={fecharMenu}>Configurações</Link>
          <Link to="/usuarios" onClick={fecharMenu}>Usuários</Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Sair
          </button>
        </div>
      </aside>

      <main className="content">
        {children}
      </main>
    </div>
  );
}
