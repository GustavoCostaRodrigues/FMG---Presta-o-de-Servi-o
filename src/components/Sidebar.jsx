import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  Wrench,
  LogOut,
  X,
  HardHat,
  LayoutDashboard,
  Clock,
  Box,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import './Sidebar.css';
import logoFazenda from '../assets/logo-fazenda.jpg';
import logoFazendaDark from '../assets/logo-fazenda-dark.png';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Início', path: '/' },
    { icon: <Users size={20} />, label: 'Clientes', path: '/clientes' },
    { icon: <Box size={20} />, label: 'Maquinário', path: '/maquinario' },
    { icon: <HardHat size={20} />, label: 'Colaboradores', path: '/colaboradores' },
    { icon: <Clock size={20} />, label: 'Histórico', path: '/historico' },
    { icon: <Calendar size={20} />, label: 'Agenda', path: '/agenda' },
    { icon: <Settings size={20} />, label: 'Ajustes', path: '/ajustes' }
  ];

  return (
    <>
      <aside className={`sidebar-match ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-mobile-header desktop-hide">
          <button className="close-btn" onClick={onClose} aria-label="Fechar menu">
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-logo-container-match">
          <img
            src={isDarkMode ? logoFazendaDark : logoFazenda}
            alt="Fazenda Morro Grande"
            className="sidebar-logo-img-match"
          />
        </div>

        <div className="sidebar-header-match">
          <div className="user-profile-match">
            <div className="avatar-match">G</div>
            <div className="user-info-match">
              <span className="user-name-match">Gustavo</span>
              <span className="user-role-match">MANAGER</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav-match">
          <ul className="nav-list-match">
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link-match ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (window.innerWidth <= 1024) onClose();
                  }}
                >
                  <span className="nav-icon-match">{item.icon}</span>
                  <span className="nav-label-match">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer-match">
          <button className="theme-toggle-btn-match" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Modo Claro' : 'Modo Noturno'}</span>
          </button>

          <button className="logout-btn-match">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="sidebar-overlay-match"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
