import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Briefcase, Mail, Phone,
    FileText, Check, Clock, DollarSign,
    MapPin, Building2, Wrench, Users, Calendar
} from 'lucide-react';
import { db, SYNC_STATUS } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const AddServiceModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customerId: '',
        machineryId: '',
        serviceTypeId: '',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        locationArea: '',
        totalAmount: '',
        paymentType: 'diaria'
    });

    const [selectedStaff, setSelectedStaff] = useState([]);

    const clients = useLiveQuery(() => db.clients.toArray()) || [];
    const machinery = useLiveQuery(() => db.machinery.toArray()) || [];
    const collaborators = useLiveQuery(() => db.collaborators.toArray()) || [];
    const serviceTypes = useLiveQuery(() => db.service_types.toArray()) || [];

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await db.services.add({
                customer_id: parseInt(formData.customerId),
                machinery_id: parseInt(formData.machineryId),
                collaborator_id: selectedStaff[0] || null, // Assuming one for now as per simple join
                service_type_id: parseInt(formData.serviceTypeId),
                date: formData.date,
                duration: formData.duration,
                location_area: formData.locationArea,
                total_amount: parseFloat(formData.totalAmount.replace(',', '.')),
                payment_type: formData.paymentType,
                status: 'pending',
                sync_status: SYNC_STATUS.PENDING_CREATE,
                created_at: new Date().toISOString()
            });
            onSave();
        } catch (error) {
            console.error("Erro ao salvar serviço:", error);
        }
    };

    const toggleStaff = (id) => {
        setSelectedStaff(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="modal-overlay"
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
                    backdropFilter: 'blur(6px)'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    style={{
                        backgroundColor: 'var(--color-surface)', borderRadius: '32px', width: '95%', maxWidth: '700px',
                        padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Nova Prestação de Serviço</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>Registre os detalhes da atividade realizada</p>
                        </div>
                        <button onClick={onClose} style={{ border: 'none', background: 'var(--ios-bg)', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                            <X size={22} color="var(--text-secondary)" />
                        </button>
                    </div>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* 1. Cliente e Maquinário */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1C1C1E', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <Building2 size={18} />
                                    </div>
                                    <select
                                        value={formData.customerId}
                                        onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid #E5E5EA', background: '#F9F9F9', fontSize: '15px', appearance: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="">Selecione o cliente</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1C1C1E', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maquinário</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <Wrench size={18} />
                                    </div>
                                    <select
                                        value={formData.machineryId}
                                        onChange={e => setFormData({ ...formData, machineryId: e.target.value })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid #E5E5EA', background: '#F9F9F9', fontSize: '15px', appearance: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="">Selecione a máquina</option>
                                        {machinery.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tipo de Serviço */}
                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1C1C1E', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de Serviço</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                    <FileText size={18} />
                                </div>
                                <select
                                    value={formData.serviceTypeId}
                                    onChange={e => setFormData({ ...formData, serviceTypeId: e.target.value })}
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid #E5E5EA', background: '#F9F9F9', fontSize: '15px', appearance: 'none', cursor: 'pointer' }}
                                >
                                    <option value="">Selecione o tipo de serviço</option>
                                    {serviceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* 2. Funcionário(s) */}
                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Equipe Responsável</label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: collaborators.length > 3 ? 'repeat(auto-fill, minmax(130px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: collaborators.length > 3 ? '8px' : '12px',
                                padding: collaborators.length > 3 ? '12px' : '16px',
                                backgroundColor: 'var(--ios-bg)',
                                borderRadius: '20px', border: '1px solid var(--border-color)'
                            }}>
                                {collaborators.map(f => (
                                    <div
                                        key={f.id}
                                        onClick={() => toggleStaff(f.id)}
                                        style={{
                                            padding: collaborators.length > 3 ? '8px 12px' : '12px 16px',
                                            borderRadius: '14px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: collaborators.length > 3 ? '8px' : '12px',
                                            backgroundColor: selectedStaff.includes(f.id) ? 'var(--brand-primary)' : 'var(--color-surface)',
                                            color: selectedStaff.includes(f.id) ? '#FFFFFF' : 'var(--text-primary)',
                                            border: '1px solid',
                                            borderColor: selectedStaff.includes(f.id) ? 'var(--brand-primary)' : 'var(--border-color)',
                                            transition: 'all 0.2s ease',
                                            boxShadow: selectedStaff.includes(f.id) ? '0 4px 12px rgba(var(--brand-primary-rgb), 0.2)' : 'none'
                                        }}
                                    >
                                        <div style={{
                                            width: collaborators.length > 3 ? '16px' : '20px',
                                            height: collaborators.length > 3 ? '16px' : '20px',
                                            borderRadius: '5px',
                                            border: '2px solid',
                                            borderColor: selectedStaff.includes(f.id) ? '#FFFFFF' : '#D1D1D6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: selectedStaff.includes(f.id) ? '#FFFFFF' : 'transparent'
                                        }}>
                                            {selectedStaff.includes(f.id) && <Check size={collaborators.length > 3 ? 12 : 14} color="var(--brand-primary)" strokeWidth={4} />}
                                        </div>
                                        <span style={{ fontSize: collaborators.length > 3 ? '13px' : '14px', fontWeight: 700 }}>{f.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2.5 Data do Serviço */}
                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1C1C1E', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data do Serviço</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                    <Calendar size={18} />
                                </div>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid #E5E5EA', background: '#F9F9F9', fontSize: '15px' }}
                                />
                            </div>
                        </div>

                        {/* 3. Tempo e Área */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1C1C1E', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tempo Gasto</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <Clock size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ex: 4h 30m"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid #E5E5EA', background: '#F9F9F9', fontSize: '15px' }}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1C1C1E', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Área do Local</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ex: Galpão A / Setor 2"
                                        value={formData.locationArea}
                                        onChange={e => setFormData({ ...formData, locationArea: e.target.value })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid #E5E5EA', background: '#F9F9F9', fontSize: '15px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Remuneração e Modalidade */}
                        <div style={{ padding: '24px', backgroundColor: 'var(--ios-bg)', borderRadius: '24px', border: '1px dashed var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-secondary)' }}>DETALHES DE PAGAMENTO</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>VALOR DA REMUNERAÇÃO</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#2E7D32' }}>
                                            <DollarSign size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="0,00"
                                            value={formData.totalAmount}
                                            onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--color-surface)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700 }}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>MODALIDADE</label>
                                    <select
                                        value={formData.paymentType}
                                        onChange={e => setFormData({ ...formData, paymentType: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--color-surface)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}
                                    >
                                        <option value="diaria">Diária</option>
                                        <option value="mensal">Mensal</option>
                                        <option value="empreitada">Empreitada</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            onClick={handleSave}
                            style={{
                                marginTop: '8px', padding: '18px', borderRadius: '20px', border: 'none',
                                background: 'var(--brand-primary)', color: '#FFFFFF', fontSize: '16px', fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                boxShadow: '0 8px 24px rgba(var(--brand-primary-rgb), 0.25)'
                            }}
                        >
                            <Check size={22} />
                            <span>Confirmar Registro</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddServiceModal;
