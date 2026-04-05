import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    ChevronLeft, Mail, Phone, MapPin, Calendar,
    FileText, CheckCircle2, Clock, Wrench
} from 'lucide-react';
import { generateServiceReport } from '../utils/pdfGenerator';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';
import { enrichServiceData } from '../utils/serviceHelpers';

const CollaboratorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isOnline } = useSync();

    const collabId = parseInt(id);

    // Buscar dados reais do Dexie
    const prof = useLiveQuery(() => db.collaborators.get(collabId));

    // Buscar serviços e enriquecer com nome do cliente
    const services = useLiveQuery(async () => {
        if (!collabId) return [];
        const items = await db.services.where('technician_id').equals(collabId).toArray();
        return Promise.all(items.map(async s => {
            const client = s.client_id ? await db.clients.get(s.client_id) : null;
            return { ...s, clientName: client?.name || 'Cliente Geral' };
        }));
    }) || [];

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                {!prof ? (
                    <div className="loader-container">Carregando dados do colaborador...</div>
                ) : (
                    <>
                        <header className="home-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <button
                                    onClick={() => navigate('/colaboradores')}
                                    style={{ border: 'none', background: '#FFFFFF', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                >
                                    <ChevronLeft size={20} color="var(--brand-primary)" />
                                </button>
                                <h2 className="greeting">Detalhes do Colaborador</h2>
                            </div>

                            <div className="balance-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800 }}>
                                            {prof.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{prof.name}</h3>
                                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0', fontWeight: 600 }}>{prof.role}</p>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
                                        {prof.status || 'Ativo'}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Mail size={16} color="rgba(255,255,255,0.7)" />
                                        <span style={{ fontSize: '14px' }}>{prof.email || 'Email não informado'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Phone size={16} color="rgba(255,255,255,0.7)" />
                                        <span style={{ fontSize: '14px' }}>{prof.phone || 'Telefone não informado'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', gridColumn: '1 / -1' }}>
                                        {(prof.specialties || ['Técnico Geral']).map(spec => (
                                            <span key={spec} style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.15)', fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </header>

                        <section className="bills-section fade-in" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontWeight: 700, margin: 0 }}>Histórico de Prestações de Serviço</h3>
                                <button
                                    className="generate-report-btn"
                                    style={{ padding: '8px 16px', height: 'auto', margin: 0 }}
                                    onClick={async () => {
                                        const enrichedData = await enrichServiceData(services);
                                        generateServiceReport({
                                            title: prof.name,
                                            subtitle: prof.role,
                                            type: 'Colaborador',
                                            data: enrichedData,
                                            filename: `relatorio-colaborador-${prof.name.toLowerCase().replace(/ /g, '-')}.pdf`
                                        });
                                    }}
                                >
                                    <FileText size={16} /> <span>Gerar Relatório</span>
                                </button>
                            </div>

                            <div className="bills-list">
                                {services.length === 0 ? (
                                    <div className="no-data-placeholder">Nenhuma OS vinculada a este colaborador.</div>
                                ) : (
                                    services.map(service => (
                                        <div key={service.id} className="bill-card">
                                            <div className="bill-status-indicator paid">
                                                <Wrench size={20} />
                                            </div>
                                            <div className="bill-info-group">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className="bill-title">{String(service.id).startsWith('OS-') ? service.id : `OS-${service.id}`} - {service.duration || 'Serviço'}</span>
                                                    {service.sync_status !== 'synced' && <Clock size={12} color="#FF9500" />}
                                                </div>
                                                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{service.clientName} • {new Date(service.date).toLocaleDateString()}</p>
                                            </div>

                                            <div className="bill-actions">
                                                <button className="view-receipt-btn">
                                                    <span>Ver OS</span>
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

export default CollaboratorDetail;
