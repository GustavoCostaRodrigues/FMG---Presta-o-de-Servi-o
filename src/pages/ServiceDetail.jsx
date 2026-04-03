import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Building2, Wrench, Users,
    Clock, MapPin, DollarSign, Calendar,
    CheckCircle2, FileText, Download, Share2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Mock data for the specific service
    const service = {
        id: id || 'SERV-001',
        date: '28/03/2026',
        status: 'Concluído',
        client: {
            name: 'Metalúrgica Silva',
            address: 'Av. das Indústrias, 1500 - São Paulo, SP',
            contact: 'Carlos Eduardo (Gerente)'
        },
        machine: {
            name: 'Torno CNC Haas ST-20',
            serial: 'SN-988221-HAAS',
            lastMaintenance: '15/01/2026'
        },
        staff: [
            { name: 'Ricardo Oliveira', role: 'Técnico Sênior', amount: 'R$ 250,00', mode: 'Diária' }
        ],
        details: {
            timeSpent: '4h 30m',
            location: 'Galpão Principal / Setor de Usinagem',
            description: 'Manutenção Preditiva Trimestral. Verificação de sensores de temperatura, lubrificação dos eixos e atualização de firmware do painel de controle.',
            totalAmount: 'R$ 250,00'
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                <header style={{ marginBottom: '32px' }}>
                    <button
                        onClick={() => navigate('/historico')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '4px', border: 'none',
                            background: 'transparent', color: 'var(--brand-primary)', fontWeight: 600,
                            cursor: 'pointer', marginBottom: '16px', padding: 0
                        }}
                    >
                        <ChevronLeft size={20} />
                        Voltar para Histórico
                    </button>

                    <div style={{
                        backgroundColor: 'var(--color-surface)', padding: '32px', borderRadius: '28px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '18px',
                                backgroundColor: 'rgba(52, 199, 89, 0.15)', color: '#34C759',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                                    Prestação {service.id}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: 600 }}>
                                    Realizada em {service.date}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={{
                                padding: '12px 20px', borderRadius: '14px', border: '1px solid var(--border-color)',
                                background: 'var(--color-surface)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px',
                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                            }}>
                                <Download size={18} />
                                PDF
                            </button>
                            <button style={{
                                padding: '12px 20px', borderRadius: '14px', border: 'none',
                                background: 'var(--brand-primary)', color: '#FFFFFF', fontWeight: 700, fontSize: '14px',
                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb), 0.2)'
                            }}>
                                <Share2 size={18} />
                                Compartilhar
                            </button>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                    {/* Left Column: Related Resources */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Client Card */}
                        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Building2 size={18} color="var(--brand-primary)" />
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Cliente</h4>
                            </div>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{service.client.name}</h5>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{service.client.address}</p>
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                <strong>Contato:</strong> {service.client.contact}
                            </div>
                        </div>

                        {/* Machine Card */}
                        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Wrench size={18} color="var(--brand-primary)" />
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Maquinário</h4>
                            </div>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{service.machine.name}</h5>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>S/N: {service.machine.serial}</p>
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                <strong>Última Manutenção:</strong> {service.machine.lastMaintenance}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Service Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card" style={{ padding: '0' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #F2F2F7' }}>
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Detalhes da Atividade</h4>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: 'var(--ios-bg)', color: 'var(--brand-primary)' }}>
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tempo Gasto</span>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{service.details.timeSpent}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: 'var(--ios-bg)', color: 'var(--brand-primary)' }}>
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Local / Área</span>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{service.details.location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Descrição Técnica</span>
                                    <div style={{
                                        marginTop: '12px', padding: '20px', borderRadius: '18px',
                                        backgroundColor: 'var(--ios-bg)', border: '1px solid var(--border-color)',
                                        fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.6
                                    }}>
                                        {service.details.description}
                                    </div>
                                </div>

                                <div>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>Equipe e Remuneração</span>
                                    {service.staff.map((member, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '16px 20px', backgroundColor: 'var(--color-surface)', borderRadius: '16px',
                                                border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    backgroundColor: 'var(--brand-primary)', color: '#FFFFFF',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '16px', fontWeight: 800
                                                }}>
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h6 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</h6>
                                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{member.role}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{member.amount}</span>
                                                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>{member.mode}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ServiceDetail;
