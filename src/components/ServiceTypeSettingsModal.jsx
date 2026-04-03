import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, CheckCircle2, Sliders } from 'lucide-react';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const ServiceTypeSettingsModal = ({ isOpen, onClose, onSave }) => {
    const [newType, setNewType] = useState('');
    const types = useLiveQuery(() => db.service_types.toArray()) || [];

    const handleAddType = async () => {
        if (!newType.trim()) return;
        try {
            await db.service_types.add({ name: newType.trim() });
            setNewType('');
        } catch (error) {
            console.error("Erro ao adicionar tipo:", error);
        }
    };

    const handleDeleteType = async (id) => {
        try {
            await db.service_types.delete(id);
        } catch (error) {
            console.error("Erro ao excluir tipo:", error);
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100,
                    backdropFilter: 'blur(8px)'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    style={{
                        backgroundColor: 'var(--color-surface)', borderRadius: '32px', width: '90%', maxWidth: '450px',
                        padding: '32px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ backgroundColor: 'var(--ios-bg)', padding: '10px', borderRadius: '12px', color: 'var(--brand-primary)' }}>
                                <Sliders size={20} />
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Tipos de Serviço</h2>
                        </div>
                        <button onClick={onClose} style={{ border: 'none', background: 'var(--ios-bg)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                            <X size={18} color="var(--text-secondary)" />
                        </button>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#8E8E93', marginBottom: '8px', textTransform: 'uppercase' }}>Novo Tipo</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                placeholder="Ex: Treinamento Técnico"
                                style={{
                                    flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--border-color)',
                                    background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px', outline: 'none'
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
                            />
                            <button
                                onClick={handleAddType}
                                style={{
                                    padding: '0 16px', borderRadius: '16px', border: 'none',
                                    background: 'var(--brand-primary)', color: '#FFFFFF', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase' }}>Tipos Cadastrados</label>
                        {types.map(type => (
                            <div
                                key={type.id}
                                style={{
                                    padding: '12px 16px', borderRadius: '14px', backgroundColor: 'var(--ios-bg)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                            >
                                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{type.name}</span>
                                <button
                                    onClick={() => handleDeleteType(type.id)}
                                    style={{ border: 'none', background: 'transparent', color: '#FF3B30', cursor: 'pointer', padding: '4px' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '32px', width: '100%', padding: '16px', borderRadius: '18px', border: 'none',
                            background: 'var(--brand-primary)', color: '#FFFFFF', fontSize: '16px', fontWeight: 700,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <CheckCircle2 size={20} />
                        Ok, Concluído
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ServiceTypeSettingsModal;
