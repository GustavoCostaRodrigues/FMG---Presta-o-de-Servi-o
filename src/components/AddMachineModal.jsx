import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Settings, Cpu, Calendar, Building2, Check, FileText, Clock } from 'lucide-react';
import { db, SYNC_STATUS } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';

const AddMachineModal = ({ isOpen, onClose, onSave }) => {
    const { syncWithServer } = useSync();
    const [formData, setFormData] = useState({
        nome: '',
        modelo: '',
        serie: '',
        clienteId: '',
        instalacao: '',
    });

    const clients = useLiveQuery(() => db.clients.toArray());

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await db.machinery.add({
                name: formData.nome,
                model: formData.modelo,
                serial_number: formData.serie,
                client_id: formData.clienteId ? parseInt(formData.clienteId) : null,
                instalacao: formData.instalacao,
                status: 'active',
                sync_status: SYNC_STATUS.PENDING_CREATE,
                created_at: new Date().toISOString()
            });
            onSave();
            syncWithServer();
        } catch (error) {
            console.error("Erro ao salvar máquina:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose} style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
                backdropFilter: 'blur(4px)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    style={{
                        backgroundColor: 'var(--color-surface)', borderRadius: '28px', width: '90%', maxWidth: '600px',
                        maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Nova Máquina</h2>
                        <button onClick={onClose} style={{ border: 'none', background: 'var(--ios-bg)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                            <X size={20} color="var(--text-secondary)" />
                        </button>
                    </div>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>NOME DO EQUIPAMENTO</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                    <Box size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                    placeholder="Ex: Torno CNC V10"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>MODELO</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <Cpu size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.modelo}
                                        onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                        placeholder="Ex: Romi V10"
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>Nº DE SÉRIE</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <Settings size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.serie}
                                        onChange={e => setFormData({ ...formData, serie: e.target.value })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                        placeholder="Ex: SN-998811"
                                    />
                                </div>
                            </div>
                        </div>



                        <button
                            type="submit"
                            onClick={handleSave}
                            style={{
                                marginTop: '20px', padding: '16px', borderRadius: '18px', border: 'none',
                                background: 'var(--brand-primary)', color: '#FFFFFF', fontSize: '16px', fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <Check size={20} />
                            <span>Salvar Máquina</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddMachineModal;
