import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Mail, Phone, FileText, Check } from 'lucide-react';
import { db, SYNC_STATUS } from '../lib/db';
import { useSync } from '../context/SyncContext';

const AddCollaboratorModal = ({ isOpen, onClose, onSave }) => {
    const { syncWithServer } = useSync();
    const [formData, setFormData] = useState({
        nome: '',
        cargo: '',
        email: '',
        telefone: ''
    });

    const applyPhoneMask = (value) => {
        const cleanValue = value.replace(/\D/g, '').slice(0, 11);
        if (cleanValue.length <= 10) {
            return cleanValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
        }
        return cleanValue.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4').replace(/-$/, '');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (!formData.nome) return;
            await db.collaborators.add({
                name: formData.nome,
                role: formData.cargo,
                email: formData.email,
                phone: formData.telefone,
                status: 'Ativo',
                sync_status: SYNC_STATUS.PENDING_CREATE,
                created_at: new Date().toISOString()
            });
            onSave();
            syncWithServer();
        } catch (error) {
            console.error("Erro ao salvar colaborador:", error);
        }
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
                    backdropFilter: 'blur(4px)'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    style={{
                        backgroundColor: 'var(--color-surface)', borderRadius: '28px', width: '90%', maxWidth: '500px',
                        padding: '32px', position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Novo Colaborador</h2>
                        <button onClick={onClose} style={{ border: 'none', background: 'var(--ios-bg)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                            <X size={20} color="var(--text-secondary)" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', marginLeft: '4px' }}>
                                NOME COMPLETO <span style={{ color: '#FF3B30' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                    placeholder="Ex: Ricardo Oliveira"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>CARGO / FUNÇÃO (OPCIONAL)</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                    <Briefcase size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.cargo}
                                    onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                    placeholder="Ex: Técnico Sênior"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>E-MAIL (OPCIONAL)</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                        placeholder="email@empresa.com"
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>TELEFONE (OPCIONAL)</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.telefone}
                                        onChange={e => setFormData({ ...formData, telefone: applyPhoneMask(e.target.value) })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                        placeholder="(11) 9 9999-9999"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                marginTop: '12px', padding: '16px', borderRadius: '18px', border: 'none',
                                background: 'var(--brand-primary)', color: '#FFFFFF', fontSize: '16px', fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <Check size={20} />
                            <span>Salvar Colaborador</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddCollaboratorModal;
