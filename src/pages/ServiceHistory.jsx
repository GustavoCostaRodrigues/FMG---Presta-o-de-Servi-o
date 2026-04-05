import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Filter, ChevronRight,
    Calendar, Wrench, Building2, Clock,
    DollarSign, MapPin, CheckCircle2,
    Settings, FileText, RefreshCw as SyncIcon
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AddServiceModal from '../components/AddServiceModal';
import { generateServiceReport } from '../utils/pdfGenerator';
import { db, SYNC_STATUS } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';
import EmptyState from '../components/EmptyState';
import { enrichServiceData } from '../utils/serviceHelpers';

const ServiceHistory = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { isOnline } = useSync();

    // Buscar dados do Dexie com joins simples
    const services = useLiveQuery(async () => {
        const items = await db.services.filter(s => s.sync_status !== SYNC_STATUS.PENDING_DELETE).toArray();
        const enrichedItems = await Promise.all(items.map(async (s) => {
            // Guard against undefined IDs to prevent Dexie/IndexedDB errors
            const client = s.client_id ? await db.clients.get(s.client_id) : null;
            const machine = s.machine_id ? await db.machinery.get(s.machine_id) : null;
            const collaborator = s.technician_id ? await db.collaborators.get(s.technician_id) : null;

            return {
                ...s,
                clientName: client?.name || 'Cliente Geral',
                machineName: machine?.name || 'Sem Máquina Vinculada',
                collaboratorName: collaborator?.name || 'Técnico Externo'
            };
        }));
        return enrichedItems;
    });

    if (services === undefined) {
        return (
            <div className="dashboard-layout">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="main-content">
                    <div className="loader-container">Carregando histórico...</div>
                </main>
            </div>
        );
    }

    const filteredServices = services.filter(s =>
        s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toString().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                <header className="home-header">
                    <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="greeting">Histórico de Serviços</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ios-bg)', padding: '6px 12px', borderRadius: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#34C759' : '#FF3B30' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    {/* Linha de Ações: Busca + Botão Novo + Configurações */}
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
                                placeholder="Buscar por cliente, máquina ou ID..."
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

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                                className="refresh-btn"
                                onClick={async () => {
                                    const enrichedData = await enrichServiceData(filteredServices);
                                    generateServiceReport({
                                        title: 'Histórico de Serviços',
                                        subtitle: searchTerm ? `Busca: "${searchTerm}"` : 'Todos os registros',
                                        type: 'Geral',
                                        data: enrichedData,
                                        filename: `relatorio-historico-${new Date().toISOString().split('T')[0]}.pdf`
                                    });
                                }}
                                style={{
                                    margin: 0,
                                    whiteSpace: 'nowrap',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '0 20px',
                                    borderRadius: '16px',
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--border-color)',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                <FileText size={18} />
                                <span>Gerar Relatório</span>
                            </button>

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
                                <span>Nova Prestação</span>
                            </button>
                        </div>
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
                        gridTemplateColumns: '44px 120px 2fr 1.5fr 1fr 120px 40px',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        <span>ID / Data</span>
                        <span>Cliente</span>
                        <span>Maquinário</span>
                        <span>Técnico</span>
                        <span>Valor</span>
                        <span></span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {filteredServices.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="Histórico vazio"
                                description="Nenhuma ordem de serviço foi encontrada no período ou com os termos pesquisados."
                            />
                        ) : (
                            filteredServices.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => navigate(`/historico/${service.id}`, { state: { from: '/historico' } })}
                                    style={{
                                        padding: '14px 16px',
                                        display: 'grid',
                                        gridTemplateColumns: '44px 120px 2fr 1.5fr 1fr 120px 40px',
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
                                    <div className={`bill-status-indicator ${service.status === 'paid' ? 'paid' : service.status === 'in_progress' ? 'in-progress' : 'pending'}`}>
                                        {service.status === 'paid' ? <CheckCircle2 size={20} /> :
                                            service.status === 'in_progress' ? <SyncIcon size={20} className="spin" /> :
                                                <Clock size={20} />}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '13px' }}>
                                                {service.id.slice(0, 8)}...
                                            </span>
                                            {service.sync_status !== 'synced' && <Clock size={12} color="#FF9500" />}
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#8E8E93' }}>{new Date(service.date).toLocaleDateString()}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '12px',
                                            backgroundColor: 'var(--ios-bg)', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', color: 'var(--text-secondary)'
                                        }}>
                                            <Building2 size={18} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'center', gap: '10px', color: '#48484A' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{service.clientName}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#48484A' }}>
                                        <Wrench size={16} color="#8E8E93" />
                                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{service.machineName}</span>
                                    </div>

                                    <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{service.collaboratorName}</span>

                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '15px' }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.valor || 0)}
                                    </span>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '12px' }}>
                                        <ChevronRight size={18} color="#C7C7CC" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <AddServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => setIsModalOpen(false)}
            />
        </div >
    );
};

export default ServiceHistory;
