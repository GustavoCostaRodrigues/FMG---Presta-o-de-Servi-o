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
                        <header style={{ marginBottom: '32px' }}>
                            <button
                                onClick={() => navigate('/colaboradores')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px', border: 'none',
                                    background: 'transparent', color: 'var(--brand-primary)', fontWeight: 600,
                                    cursor: 'pointer', marginBottom: '16px', padding: 0
                                }}
                            >
                                <ChevronLeft size={20} />
                                Voltar para Colaboradores
                            </button>

                            <div style={{
                                backgroundColor: 'var(--brand-primary)', padding: '32px', borderRadius: '28px',
                                color: '#FFFFFF', display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', boxShadow: '0 8px 30px rgba(var(--brand-primary-rgb), 0.15)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.2)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800
                                    }}>
                                        {prof.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '10px', marginBottom: '8px', width: 'fit-content' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? '#4CAF50' : '#FF5252' }} />
                                            <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8 }}>{isOnline ? 'CLOUD' : 'OFFLINE'}</span>
                                        </div>
                                        <h3 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>{prof.name}</h3>
                                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0' }}>{prof.role}</p>
                                    </div>
                                </div>
                                <div style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px',
                                    borderRadius: '12px', fontSize: '14px', fontWeight: 700
                                }}>
                                    {prof.status}
                                </div>
                            </div>
                        </header>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                            {/* Left Column: Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div className="card" style={{ padding: '24px' }}>
                                    <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700 }}>Informações Pessoais</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#48484A' }}>
                                            <Mail size={18} color="var(--brand-primary)" />
                                            <span>{prof.email}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#48484A' }}>
                                            <Phone size={18} color="var(--brand-primary)" />
                                            <span>{prof.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '24px' }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>Especialidades</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {(prof.specialties || ['Técnico Geral']).map(spec => (
                                            <span key={spec} style={{
                                                padding: '6px 12px', borderRadius: '10px',
                                                backgroundColor: '#F2F2F7', fontSize: '12px', fontWeight: 600, color: '#48484A'
                                            }}>
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Service History */}
                            <div className="card" style={{ padding: '0' }}>
                                <div style={{ padding: '24px', borderBottom: '1px solid #F2F2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Histórico de Prestações de Serviço</h4>
                                    <button
                                        className="generate-report-btn"
                                        style={{ padding: '8px 16px', height: 'auto' }}
                                        onClick={() => {
                                            generateServiceReport({
                                                title: prof.name,
                                                subtitle: prof.role,
                                                type: 'Colaborador',
                                                data: services,
                                                filename: `relatorio-colaborador-${prof.name.toLowerCase().replace(/ /g, '-')}.pdf`
                                            });
                                        }}
                                    >
                                        <FileText size={16} /> <span>Gerar Relatório</span>
                                    </button>
                                </div>

                                {services.length === 0 ? (
                                    <div className="no-data-placeholder" style={{ padding: '32px' }}>Nenhuma OS vinculada a este colaborador.</div>
                                ) : (
                                    services.map((service, index) => (
                                        <div
                                            key={service.id}
                                            style={{
                                                padding: '20px 24px', borderBottom: index === services.length - 1 ? 'none' : '1px solid #F2F2F7',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                                                    <Wrench size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{String(service.id).startsWith('OS-') ? service.id : `OS-${service.id}`} - {service.duration || 'Serviço'}</h5>
                                                        {service.sync_status !== 'synced' && <Clock size={12} color="#FF9500" />}
                                                    </div>
                                                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#8E8E93' }}>{service.clientName} • {new Date(service.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand-primary)', cursor: 'pointer' }}>
                                                Ver OS
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default CollaboratorDetail;
