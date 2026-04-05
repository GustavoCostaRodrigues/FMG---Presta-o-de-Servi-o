import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronLeft, Building2, Wrench, Users,
    Clock, MapPin, DollarSign, Calendar,
    CheckCircle2, FileText, Download, User, ChevronRight, Trash2,
    RefreshCw as SyncIcon
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { db, SYNC_STATUS } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { generateServiceReport } from '../utils/pdfGenerator';
import { useSync } from '../context/SyncContext';
import { enrichServiceData } from '../utils/serviceHelpers';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const ServiceDetail = () => {
    const { id: serviceId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { syncWithServer } = useSync();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Determina de onde o usuário veio para o botão "Voltar" inteligente
    const fromPath = location.state?.from || '/historico';
    const backLabel = fromPath === '/' ? 'Voltar para Início' : 'Voltar para Histórico';

    // Buscar dados reais do banco
    const service = useLiveQuery(() => db.services.get(serviceId), [serviceId]);
    const client = useLiveQuery(() => service ? db.clients.get(service.client_id) : null, [service]);
    const machine = useLiveQuery(() => service ? db.machinery.get(service.machine_id) : null, [service]);
    const technician = useLiveQuery(() => service ? db.collaborators.get(service.technician_id) : null, [service]);
    const serviceType = useLiveQuery(() => service ? db.service_types.get(service.service_type_id) : null, [service]);

    if (!service) {
        return (
            <div className="dashboard-layout">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Carregando dados da prestação...</p>
                </main>
            </div>
        );
    }

    const handleGeneratePDF = async () => {
        try {
            const enrichedData = await enrichServiceData([service]);
            generateServiceReport({
                title: client?.name || 'Cliente',
                subtitle: machine?.name || 'Maquinário',
                type: 'Serviço Técnico',
                data: enrichedData,
                filename: `OS-${serviceId}-${client?.name || ''}.pdf`
            });
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            console.group('🛠️ Diagnóstico Alteração de Status');
            console.log(`Alterando status do serviço ${serviceId} para: ${newStatus}`);

            const idToUpdate = isNaN(serviceId) ? serviceId : Number(serviceId);

            await db.services.update(idToUpdate, {
                status: newStatus,
                sync_status: SYNC_STATUS.PENDING_UPDATE,
                updated_at: new Date().toISOString()
            });

            const updatedRecord = await db.services.get(idToUpdate);
            console.log('Registro após update local:', updatedRecord);
            console.groupEnd();

            syncWithServer();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            console.groupEnd();
        }
    };

    const handleDelete = async () => {
        try {
            await db.services.update(serviceId, { sync_status: SYNC_STATUS.PENDING_DELETE });
            setIsDeleteModalOpen(false);
            navigate('/historico');
            syncWithServer();
        } catch (error) {
            console.error("Erro ao excluir serviço:", error);
            alert("Não foi possível excluir o serviço no momento.");
        }
    };

    const formatCurrency = (val) => {
        if (!val) return '---';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Data não definida';
        try {
            return new Date(dateStr).toLocaleDateString('pt-BR');
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                <header style={{ marginBottom: '32px' }}>
                    <button
                        onClick={() => navigate(fromPath)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', border: 'none',
                            background: 'transparent', color: '#00875E', fontWeight: 700,
                            cursor: 'pointer', marginBottom: '20px', padding: 0, fontSize: '15px'
                        }}
                    >
                        <ChevronLeft size={20} />
                        {backLabel}
                    </button>

                    <div style={{
                        backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '32px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.04)', border: '1px solid #E5E5EA',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FDFB 100%)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '22px',
                                backgroundColor: service.status === 'pending' ? 'rgba(255, 149, 0, 0.12)' :
                                    service.status === 'in_progress' ? 'rgba(0, 122, 255, 0.12)' :
                                        'rgba(52, 199, 89, 0.15)',
                                color: service.status === 'pending' ? '#FF9500' :
                                    service.status === 'in_progress' ? '#007AFF' :
                                        '#34C759',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
                                transition: 'all 0.3s ease'
                            }}>
                                {service.status === 'pending' ? <Clock size={36} /> :
                                    service.status === 'in_progress' ? <SyncIcon size={36} className="spin" /> :
                                        <CheckCircle2 size={36} />}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1C1C1E', margin: 0, letterSpacing: '-0.02em' }}>
                                            {serviceType?.name || 'Serviço'} - {client?.name || 'Cliente'}
                                        </h2>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#8E8E93', fontWeight: 600, fontFamily: 'monospace' }}>
                                            {service.id}
                                        </p>
                                    </div>
                                </div>
                                <p style={{ color: '#8E8E93', margin: 0, fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={16} /> Realizada em {formatDate(service.date)}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    style={{
                                        padding: '14px 20px', borderRadius: '18px', border: '1px solid #FF3B30',
                                        background: 'transparent', color: '#FF3B30', fontWeight: 800, fontSize: '15px',
                                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255, 59, 48, 0.05)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <Trash2 size={20} />
                                    Excluir
                                </button>

                                <button
                                    onClick={handleGeneratePDF}
                                    style={{
                                        padding: '14px 28px', borderRadius: '18px', border: 'none',
                                        background: '#00875E', color: '#FFFFFF', fontWeight: 800, fontSize: '15px',
                                        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                                        boxShadow: '0 8px 20px rgba(0, 135, 94, 0.25)',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <Download size={20} />
                                    Gerar Relatório PDF
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={() => handleStatusUpdate('pending')}
                                    style={{
                                        padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 800,
                                        backgroundColor: '#FFFFFF',
                                        color: service.status === 'pending' ? '#FF9500' : '#8E8E93',
                                        border: '2px solid',
                                        borderColor: service.status === 'pending' ? '#FF9500' : '#E5E5EA',
                                        cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase'
                                    }}
                                >
                                    Em Aberto
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('in_progress')}
                                    style={{
                                        padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 800,
                                        backgroundColor: '#FFFFFF',
                                        color: service.status === 'in_progress' ? '#007AFF' : '#8E8E93',
                                        border: '2px solid',
                                        borderColor: service.status === 'in_progress' ? '#007AFF' : '#E5E5EA',
                                        cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase'
                                    }}
                                >
                                    Executando
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('paid')}
                                    style={{
                                        padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 800,
                                        backgroundColor: '#FFFFFF',
                                        color: service.status === 'paid' ? '#34C759' : '#8E8E93',
                                        border: '2px solid',
                                        borderColor: service.status === 'paid' ? '#34C759' : '#E5E5EA',
                                        cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase'
                                    }}
                                >
                                    Concluída
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E5E5EA', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(0, 135, 94, 0.1)', color: '#00875E' }}>
                                    <Building2 size={20} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</h4>
                            </div>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 800, color: '#1C1C1E' }}>{client?.name || 'Cliente não encontrado'}</h5>
                            <p style={{ margin: 0, fontSize: '14px', color: '#8E8E93', lineHeight: 1.6 }}>
                                {client?.rua || ''}{client?.numero ? `, ${client.numero}` : ''}
                                {client?.cidade ? ` - ${client.cidade}` : ''}
                                {client?.estado ? `, ${client.estado}` : ''}
                            </p>

                            <button
                                onClick={() => client && navigate(`/clientes/${client.id}/historico`)}
                                style={{
                                    marginTop: '20px', width: '100%', padding: '12px', borderRadius: '14px',
                                    border: '1px solid #E5E5EA', background: '#F2F2F7',
                                    color: '#00875E', fontWeight: 700, fontSize: '13px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
                                }}
                            >
                                Ver Ficha do Cliente <ChevronRight size={14} />
                            </button>
                        </div>

                        <div style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E5E5EA', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(0, 135, 94, 0.1)', color: '#00875E' }}>
                                    <Wrench size={20} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maquinário</h4>
                            </div>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 800, color: '#1C1C1E' }}>{machine?.name || 'Máquina não vinculada'}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8E8E93', fontSize: '14px' }}>
                                    <FileText size={14} /> <span>S/N: {machine?.serial_number || '---'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8E8E93', fontSize: '14px' }}>
                                    <MapPin size={14} /> <span>Instalação: {machine?.instalacao || '---'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ borderRadius: '28px', border: '1px solid #E5E5EA', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
                            <div style={{ padding: '24px 32px', backgroundColor: 'rgba(0, 135, 94, 0.02)', borderBottom: '1px solid #E5E5EA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C1C1E' }}>Detalhes da Atividade</h4>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#00875E', backgroundColor: 'rgba(0, 135, 94, 0.1)', padding: '4px 12px', borderRadius: '8px' }}>
                                    {serviceType?.name || 'Manutenção'}
                                </span>
                            </div>

                            <div style={{ padding: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                                    <div style={{ backgroundColor: '#F2F2F7', padding: '20px', borderRadius: '20px', border: '1px solid #E5E5EA' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#00875E' }}>
                                            <Clock size={20} />
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tempo Gasto</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#1C1C1E' }}>
                                            {service.duration ? `${service.duration} horas` : '---'}
                                        </p>
                                    </div>

                                    <div style={{ backgroundColor: '#F2F2F7', padding: '20px', borderRadius: '20px', border: '1px solid #E5E5EA' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#00875E' }}>
                                            <MapPin size={20} />
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Área Trabalhada</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C1C1E' }}>
                                            {service.area || 'Área não informada'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '40px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <FileText size={18} color="#8E8E93" />
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C1C1E', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Descrição Técnica</span>
                                    </div>
                                    <div style={{
                                        padding: '24px', borderRadius: '20px',
                                        backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB',
                                        fontSize: '16px', color: '#1C1C1E', lineHeight: 1.7
                                    }}>
                                        {service.title || 'Nenhuma descrição técnica detalhada foi fornecida para este serviço.'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <Users size={18} color="#8E8E93" />
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C1C1E', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Equipe e Remuneração</span>
                                    </div>

                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '24px',
                                        border: '1px solid #E5E5EA', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                            <div style={{
                                                width: '56px', height: '56px', borderRadius: '18px',
                                                backgroundColor: '#00875E', color: '#FFFFFF',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '22px', fontWeight: 900
                                            }}>
                                                {technician?.name ? technician.name.charAt(0) : <User />}
                                            </div>
                                            <div>
                                                <h6 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C1C1E' }}>{technician?.name || 'Técnico Externo'}</h6>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 600, color: '#8E8E93' }}>{technician?.role || 'Prestador de Serviço'}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>VALOR TOTAL</div>
                                            <span style={{ fontSize: '20px', fontWeight: 900, color: '#1C1C1E' }}>
                                                {formatCurrency(service.valor)}
                                            </span>

                                            <div style={{ marginTop: '12px', borderTop: '1px dashed #E5E5EA', paddingTop: '12px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Custo do Técnico ({technician?.tipo_recebimento || 'Geral'})
                                                </div>
                                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#1C1C1E' }}>
                                                    {formatCurrency(service.valor_hh)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                serviceId={serviceId}
            />
        </div>
    );
};

export default ServiceDetail;
