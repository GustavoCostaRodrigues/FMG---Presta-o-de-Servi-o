import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, CheckCircle2, Clock, Eye, Pencil, Trash2,
    Download, Calendar, User, Building2, FileText
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateServiceReport } from '../utils/pdfGenerator';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const ClientHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const clientId = parseInt(id);

    // Buscar dados reais do Dexie
    const clientInfo = useLiveQuery(() => db.clients.get(clientId));
    const services = useLiveQuery(() => db.services.where('client_id').equals(clientId).toArray()) || [];

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const handleGenerateReport = () => {
        if (!clientInfo) return;
        generateServiceReport({
            title: clientInfo.name,
            subtitle: `${clientInfo.type}: ${clientInfo.document}`,
            type: 'Cliente',
            data: services,
            filename: `relatorio-cliente-${clientInfo.name.toLowerCase().replace(/ /g, '-')}.pdf`
        });
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                {!clientInfo ? (
                    <div className="loader-container">Carregando dados do cliente...</div>
                ) : (
                    <>
                        <header className="home-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <button
                                    onClick={() => navigate('/clientes')}
                                    style={{ border: 'none', background: '#FFFFFF', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                >
                                    <ChevronLeft size={20} color="var(--brand-primary)" />
                                </button>
                                <h2 className="greeting">Histórico de Serviços</h2>
                            </div>

                            <div className="balance-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {clientInfo.type === 'PJ' ? <Building2 size={32} /> : <User size={32} />}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{clientInfo.name}</h3>
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0' }}>{clientInfo.type}: {clientInfo.document}</p>
                                </div>
                            </div>
                        </header>

                        <section className="bills-section fade-in" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontWeight: 700 }}>Todos os Serviços Prestados</h3>
                                <button
                                    className="generate-report-btn"
                                    style={{ padding: '8px 16px', height: 'auto' }}
                                    onClick={handleGenerateReport}
                                >
                                    <FileText size={16} /> <span>Gerar Relatório</span>
                                </button>
                            </div>

                            <div className="bills-list">
                                {services.length === 0 ? (
                                    <div className="no-data-placeholder">Nenhum serviço registrado para este cliente.</div>
                                ) : (
                                    services.map(item => (
                                        <div key={item.id} className="bill-card">
                                            <div className={`bill-status-indicator paid`}>
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div className="bill-info-group">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className="bill-title">{String(item.id).startsWith('OS-') ? item.id : `OS-${item.id}`} - {item.duration || 'Serviço'}</span>
                                                    {item.sync_status !== 'synced' && <Clock size={12} color="#FF9500" />}
                                                </div>
                                                <span className="bill-created">Executado em: {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                            </div>

                                            <div className="bill-amount-group">
                                                <span className="bill-amount">{formatCurrency(item.total_amount || 0)}</span>
                                            </div>

                                            <div className="bill-actions">
                                                <button className="view-receipt-btn">
                                                    <Eye size={16} /> <span>Visualizar OS</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default ClientHistory;
