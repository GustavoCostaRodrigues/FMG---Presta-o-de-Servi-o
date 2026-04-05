import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Building2, Wrench, Users, Clock,
    MapPin, DollarSign, Calendar, CheckCircle2,
    FileText, Map
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ServiceDetailModal = ({ isOpen, onClose, service }) => {
    if (!service) return null;

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-container service-detail-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '14px',
                                    backgroundColor: 'var(--brand-primary)', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0, 135, 94, 0.2)'
                                }}>
                                    <Wrench size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1C1C1E' }}>
                                        {service.serviceTypeName || 'Serviço'} - {service.clientName}
                                    </h2>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'monospace', opacity: 0.7 }}>
                                        {service.id}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    border: 'none', background: 'var(--ios-bg)', width: '32px', height: '32px',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E5E5EA'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--ios-bg)'}
                            >
                                <X size={18} strokeWidth={3} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'var(--ios-bg)', borderRadius: '16px' }}>
                                <Calendar className="text-brand" size={20} />
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Data</span>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 700 }}>
                                        {service.date ? format(new Date(service.date), "dd/MM/yy", { locale: ptBR }) : '---'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'var(--ios-bg)', borderRadius: '16px' }}>
                                <Clock className="text-brand" size={20} />
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tempo Gasto</span>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 700 }}>
                                        {service.duration ? `${service.duration} horas` : '---'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'var(--ios-bg)', borderRadius: '16px' }}>
                                <MapPin className="text-brand" size={20} />
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Área</span>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 700 }}>
                                        {service.area || '---'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Cliente e Máquina */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="detail-card" style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--brand-primary)' }}>
                                        <Building2 size={18} />
                                        <span style={{ fontSize: '13px', fontWeight: 800 }}>Cliente</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{service.clientName}</p>
                                </div>
                                <div className="detail-card" style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--brand-primary)' }}>
                                        <Wrench size={18} />
                                        <span style={{ fontSize: '13px', fontWeight: 800 }}>Maquinário</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{service.machineName}</p>
                                </div>
                            </div>

                            {/* Técnico e Valor */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="detail-card" style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--brand-primary)' }}>
                                        <Users size={18} />
                                        <span style={{ fontSize: '13px', fontWeight: 800 }}>Técnico</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{service.collaboratorName}</p>
                                </div>
                                <div className="detail-card" style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--brand-primary)' }}>
                                        <DollarSign size={18} />
                                        <span style={{ fontSize: '13px', fontWeight: 800 }}>Valor Total</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--brand-primary)' }}>{formatCurrency(service.valor)}</p>
                                </div>
                            </div>

                            {/* Descrição */}
                            <div className="description-section" style={{ marginTop: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <FileText size={18} className="text-secondary" />
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Descrição da Atividade</span>
                                </div>
                                <div style={{
                                    padding: '20px', backgroundColor: 'var(--ios-bg)', borderRadius: '18px',
                                    fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)'
                                }}>
                                    {service.title || service.description || 'Nenhuma descrição detalhada fornecida para este serviço.'}
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                <button className="refresh-btn" style={{ flex: 1, justifyContent: 'center' }}>
                                    <FileText size={18} />
                                    <span>Gerar PDF</span>
                                </button>
                                <button className="generate-report-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
                                    <CheckCircle2 size={18} />
                                    <span>Concluir</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ServiceDetailModal;
