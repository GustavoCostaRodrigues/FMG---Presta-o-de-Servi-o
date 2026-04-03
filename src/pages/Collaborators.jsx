import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Search, Plus, HardHat, ChevronRight, Filter,
    MoreVertical, Mail, Phone, BadgeCheck, Clock
} from 'lucide-react';
import AddCollaboratorModal from '../components/AddCollaboratorModal';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';

const Collaborators = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { isOnline } = useSync();

    const collaborators = useLiveQuery(
        () => db.collaborators
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.role.toLowerCase().includes(searchTerm.toLowerCase()))
            .toArray(),
        [searchTerm]
    );

    const filteredCollaborators = collaborators || [];

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                <header className="home-header">
                    <div className="header-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: isOnline ? '#34C759' : '#FF3B30'
                                }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Linha de Ações: Busca + Botão Novo */}
                    <div className="dashboard-actions-row" style={{
                        marginTop: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div className="filter-card" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <div className="filter-icon-wrapper">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                className="month-selector-input"
                                placeholder="Buscar por nome ou cargo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    padding: '12px 8px'
                                }}
                            />
                        </div>

                        <button
                            className="generate-report-btn"
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                margin: 0,
                                whiteSpace: 'nowrap',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Plus size={20} />
                            <span>Novo Colaborador</span>
                        </button>
                    </div>
                </header>

                <div className="card" style={{
                    padding: '8px',
                    background: 'var(--color-surface)',
                    borderRadius: '28px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{
                        padding: '16px 24px',
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.5fr 1fr 1fr 40px',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        <span>Colaborador</span>
                        <span>Cargo</span>
                        <span>Status</span>
                        <span>Atividade</span>
                        <span></span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {filteredCollaborators.map((colab) => (
                            <div
                                key={colab.id}
                                onClick={() => navigate(`/colaboradores/${colab.id}`)}
                                style={{
                                    padding: '12px 16px',
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 40px',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    borderRadius: '20px',
                                    margin: '0 8px'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#F2F2F7';
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '16px',
                                        backgroundColor: 'var(--ios-bg)', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'var(--brand-primary)', fontWeight: 800,
                                        fontSize: '18px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        {colab.name.charAt(0)}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{colab.name}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                            <Mail size={12} />
                                            <span style={{ fontSize: '12px' }}>{colab.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 600, color: '#48484A', fontSize: '14px' }}>{colab.role}</span>
                                <div>
                                    <span style={{
                                        padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800,
                                        backgroundColor: colab.status === 'Ativo' ? '#E8F5E9' : '#FFF3E0',
                                        color: colab.status === 'Ativo' ? '#2E7D32' : '#EF6C00',
                                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                        {colab.status.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {colab.sync_status !== 'synced' && <Clock size={12} color="#FF9500" />}
                                        <span style={{ fontSize: '11px', color: colab.sync_status !== 'synced' ? '#FF9500' : 'var(--text-secondary)' }}>
                                            {colab.sync_status === 'synced' ? 'Sincronizado' : 'Offline'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Última OS</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '12px' }}>
                                    <ChevronRight size={18} color="#C7C7CC" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <AddCollaboratorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Collaborators;