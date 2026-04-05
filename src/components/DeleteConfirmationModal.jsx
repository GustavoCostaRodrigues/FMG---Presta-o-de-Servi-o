import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Copy, Trash2, CheckCircle2 } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, serviceId }) => {
    const [inputValue, setInputValue] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setInputValue('');
            setIsCopied(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(serviceId);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const isMatch = inputValue === serviceId;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="modal-overlay"
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
                    backdropFilter: 'blur(8px)'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="modal-container"
                    onClick={e => e.stopPropagation()}
                    style={{
                        backgroundColor: '#FFFFFF', borderRadius: '32px', width: '95%', maxWidth: '480px',
                        padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255, 59, 48, 0.1)'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            backgroundColor: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px auto'
                        }}>
                            <AlertTriangle size={32} />
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1C1C1E', margin: '0 0 8px 0' }}>Ação Permanente</h2>
                        <p style={{ fontSize: '15px', color: '#8E8E93', fontWeight: 500, lineHeight: 1.5 }}>
                            Você está prestes a excluir este serviço permanentemente. Esta ação não pode ser desfeita na nuvem após a sincronização.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#F2F2F7', padding: '20px', borderRadius: '20px',
                        marginBottom: '24px', border: '1px dashed #D1D1D6'
                    }}>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Copie o UUID para confirmar:
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <code style={{
                                flex: 1, fontSize: '13px', fontFamily: 'monospace', color: '#1C1C1E',
                                overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600
                            }}>
                                {serviceId}
                            </code>
                            <button
                                onClick={handleCopy}
                                style={{
                                    border: 'none', background: isCopied ? '#34C759' : '#00875E',
                                    color: '#FFFFFF', padding: '8px 12px', borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
                                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                {isCopied ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1C1C1E', marginBottom: '10px' }}>
                            Digite o UUID abaixo:
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            placeholder="Cole o UUID aqui..."
                            style={{
                                width: '100%', padding: '16px', borderRadius: '16px',
                                border: '2px solid', borderColor: isMatch ? '#34C759' : '#E5E5EA',
                                backgroundColor: isMatch ? 'rgba(52, 199, 89, 0.05)' : '#FFFFFF',
                                fontSize: '15px', color: '#1C1C1E', fontWeight: 600, outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '16px', borderRadius: '16px', border: 'none',
                                background: '#F2F2F7', color: '#1C1C1E', fontWeight: 700,
                                fontSize: '15px', cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => isMatch && onConfirm()}
                            disabled={!isMatch}
                            style={{
                                flex: 1.5, padding: '16px', borderRadius: '16px', border: 'none',
                                background: isMatch ? '#FF3B30' : '#E5E5EA',
                                color: isMatch ? '#FFFFFF' : '#8E8E93',
                                fontWeight: 800, fontSize: '15px', cursor: isMatch ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: isMatch ? '0 8px 20px rgba(255, 59, 48, 0.25)' : 'none'
                            }}
                        >
                            <Trash2 size={18} />
                            Excluir Permanentemente
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeleteConfirmationModal;
