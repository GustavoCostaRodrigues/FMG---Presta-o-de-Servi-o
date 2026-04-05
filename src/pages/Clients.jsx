import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, User, Mail, Phone, MapPin, ChevronRight, Filter,
    MoreHorizontal, Briefcase, Building2, Clock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AddClientModal from '../components/AddClientModal';
import './Clients.css';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';
import EmptyState from '../components/EmptyState';

const Clients = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { isOnline } = useSync();

    // Buscar dados do Dexie (reativo)
    const clients = useLiveQuery(
        () => db.clients
            .filter(c => (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
            .toArray(),
        [searchQuery]
    );

    const handleClientClick = (id) => {
        navigate(`/clientes/${id}/historico`);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                <header className="home-header">
                    <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="greeting">Meus Clientes</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ios-bg)', padding: '6px 12px', borderRadius: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#34C759' : '#FF3B30' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    <div className="dashboard-actions-row" style={{ marginTop: '24px' }}>
                        <div className="filter-card" style={{ flex: 1 }}>
                            <div className="filter-icon-wrapper"><Search size={18} /></div>
                            <input
                                type="text"
                                className="month-selector-input"
                                placeholder="Buscar por nome ou documento..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }}
                            />
                        </div>

                        <div className="action-buttons-group">
                            <button className="generate-report-btn" onClick={() => setIsAddModalOpen(true)}>
                                <Plus size={18} />
                                <span>Novo Cliente</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="clients-container fade-in">
                    {!clients ? (
                        <div className="loader-container">Carregando...</div>
                    ) : clients.length === 0 ? (
                        <EmptyState
                            icon={User}
                            title="Nenhum cliente cadastrado"
                            description="Sua base de clientes está vazia. Adicione seu primeiro cliente para começar a gerenciar seus serviços."
                        />
                    ) : (
                        <div className="clients-grid">
                            {clients.map(client => (
                                <div key={client.id} className="client-card" onClick={() => handleClientClick(client.id)}>
                                    <div className="client-card-header">
                                        <div className="client-avatar">
                                            {client.type === 'PJ' ? <Building2 size={24} /> : <User size={24} />}
                                        </div>
                                        <span className="client-type-badge">{client.type}</span>
                                    </div>

                                    <h3 className="client-name">{client.name}</h3>

                                    <div className="client-info-item">
                                        <Mail size={16} />
                                        <span>{client.email}</span>
                                    </div>

                                    <div className="client-info-item">
                                        <Phone size={16} />
                                        <span>{client.phone}</span>
                                    </div>

                                    <div className="client-info-item">
                                        <MapPin size={16} />
                                        <span className="client-address-text">
                                            {client.rua ? `${client.rua}, ${client.numero} - ${client.bairro}, ${client.cidade}` : 'Endereço não informado'}
                                        </span>
                                    </div>

                                    <div className="client-card-footer">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {client.sync_status !== 'synced' && <Clock size={14} color="#FF9500" />}
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: client.sync_status !== 'synced' ? '#FF9500' : '#34C759' }}>
                                                {client.sync_status === 'synced' ? '✓ Sincronizado' : '⌚ Pendente'}
                                            </span>
                                        </div>
                                        <div className="view-history-link">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <AddClientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={() => setIsAddModalOpen(false)}
            />
        </div >
    );
};

export default Clients;
