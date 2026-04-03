import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, CheckCircle2, Clock, Eye, Pencil, Trash2,
    Box, Settings, Cpu, Calendar, Building2, Wrench, ShieldCheck, FileText
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateServiceReport } from '../utils/pdfGenerator';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';

const MachineryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isOnline } = useSync();

    const machineId = parseInt(id);

    // Buscar dados reais do Dexie
    const machineInfo = useLiveQuery(() => db.machinery.get(machineId));

    // Buscar serviços e enriquecer com nome do técnico
    const services = useLiveQuery(async () => {
        if (!machineId) return [];
        const items = await db.services.where('machine_id').equals(machineId).toArray();
        return Promise.all(items.map(async s => {
            const colab = s.technician_id ? await db.collaborators.get(s.technician_id) : null;
            return { ...s, technicianName: colab?.name || 'Técnico Externo' };
        }));
    }) || [];

    const [status, setStatus] = useState(machineInfo?.status || 'active');

    useEffect(() => {
        if (machineInfo?.status) setStatus(machineInfo.status);
    }, [machineInfo]);

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const handleGenerateReport = () => {
        generateServiceReport({
            title: machineInfo.name,
            subtitle: `Modelo: ${machineInfo.model} | SN: ${machineInfo.serial}`,
            type: 'Maquinário',
            data: services,
            filename: `relatorio-maquina-${machineInfo.name.toLowerCase().replace(/ /g, '-')}.pdf`
        });
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                {!machineInfo ? (
                    <div className="loader-container">Carregando dados do maquinário...</div>
                ) : (
                    <>
                        <header className="home-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <button
                                    onClick={() => navigate('/maquinario')}
                                    style={{ border: 'none', background: '#FFFFFF', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                >
                                    <ChevronLeft size={20} color="var(--brand-primary)" />
                                </button>
                                <h2 className="greeting">Detalhes do Maquinário</h2>
                            </div>

                            <div className="balance-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box size={40} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '10px', marginBottom: '8px', width: 'fit-content' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? '#4CAF50' : '#FF5252' }} />
                                                    <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8 }}>{isOnline ? 'CLOUD SYNC' : 'OFFLINE MODE'}</span>
                                                </div>
                                                <h3 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>{machineInfo.name}</h3>
                                                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0' }}>SN: {machineInfo.serial_number}</p>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                gap: '8px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                padding: '4px',
                                                borderRadius: '14px',
                                                width: 'fit-content'
                                            }}>
                                                {[
                                                    { id: 'active', label: 'Operacional', color: '#4CAF50' },
                                                    { id: 'maintenance', label: 'Manutenção', color: '#FF9800' },
                                                    { id: 'inactive', label: 'Não Operacional', color: '#F44336' }
                                                ].map((btn) => (
                                                    <button
                                                        key={btn.id}
                                                        onClick={() => setStatus(btn.id)}
                                                        style={{
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: '10px',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            backgroundColor: status === btn.id ? '#FFFFFF' : 'transparent',
                                                            color: status === btn.id ? btn.color : 'rgba(255, 255, 255, 0.7)',
                                                            boxShadow: status === btn.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                                            transform: status === btn.id ? 'scale(1.02)' : 'scale(1)'
                                                        }}
                                                    >
                                                        {btn.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="info-meta">
                                        <Cpu size={16} opacity={0.7} />
                                        <div>
                                            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>Modelo</span>
                                            <span style={{ fontWeight: 600 }}>{machineInfo.model}</span>
                                        </div>
                                    </div>
                                    <div className="info-meta">
                                        <Building2 size={16} opacity={0.7} />
                                        <div>
                                            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>Cliente</span>
                                            <span style={{ fontWeight: 600 }}>{machineInfo.client}</span>
                                        </div>
                                    </div>
                                    <div className="info-meta">
                                        <Calendar size={16} opacity={0.7} />
                                        <div>
                                            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>Instalação</span>
                                            <span style={{ fontWeight: 600 }}>{machineInfo.purchaseDate}</span>
                                        </div>
                                    </div>
                                    <div className="info-meta">
                                        <ShieldCheck size={16} opacity={0.7} />
                                        <div>
                                            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>Garantia</span>
                                            <span style={{ fontWeight: 600 }}>{machineInfo.warranty}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <section className="bills-section fade-in" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontWeight: 700 }}>Histórico de Ordens de Serviço</h3>
                                <button
                                    className="generate-report-btn"
                                    style={{ padding: '8px 16px', height: 'auto' }}
                                    onClick={handleGenerateReport}
                                >
                                    <FileText size={16} /> <span>Gerar Relatório</span>
                                </button>
                            </div>

                            <div className="bills-list">
                                {services.map(item => (
                                    <div key={item.id} className="bill-card">
                                        <div className="bill-status-indicator paid">
                                            <Wrench size={20} />
                                        </div>

                                        <div className="bill-info-group">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="bill-title">{String(item.id).startsWith('OS-') ? item.id : `OS-${item.id}`} - {item.duration || 'Manutenção'}</span>
                                                {item.sync_status !== 'synced' && <Clock size={12} color="#FF9500" />}
                                            </div>
                                            <span className="bill-created">Executado por: {item.technicianName} em {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                        </div>

                                        <div className="bill-amount-group">
                                            <span className="bill-amount">{formatCurrency(item.total_amount || 0)}</span>
                                        </div>

                                        <div className="bill-actions">
                                            <button className="view-receipt-btn">
                                                <Eye size={16} /> <span>Ver Relatório</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default MachineryDetail;
