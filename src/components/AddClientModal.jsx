import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin, Building2, User, Phone, Mail, FileText, Check, Clock } from 'lucide-react';
import { db, SYNC_STATUS } from '../lib/db';
import { useSync } from '../context/SyncContext';
import { supabase } from '../lib/supabase';

const AddClientModal = ({ isOpen, onClose, onSave }) => {
    const { syncWithServer } = useSync();
    const [clientType, setClientType] = useState('PJ'); // 'PF' or 'PJ'
    const [loadingCep, setLoadingCep] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        documento: '',
        email: '',
        telefone: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        complemento: ''
    });

    const applyMask = (value, maskType) => {
        const cleanValue = value.replace(/\D/g, '');
        if (maskType === 'CEP') {
            return cleanValue.slice(0, 8).replace(/(\d{5})(\d{1,3})/, '$1-$2');
        }
        if (maskType === 'Phone') {
            const limited = cleanValue.slice(0, 11);
            if (limited.length <= 10) {
                return limited.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
            }
            return limited.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4').replace(/-$/, '');
        }
        if (maskType === 'CPF') {
            return cleanValue.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        }
        if (maskType === 'CNPJ') {
            return cleanValue.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
        }
        return value;
    };

    const handleCepSearch = async (cep) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        rua: data.logradouro,
                        bairro: data.bairro,
                        cidade: data.localidade,
                        estado: data.uf
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const clientData = {
            name: formData.name,
            document: formData.documento,
            email: formData.email,
            phone: formData.telefone,
            cep: formData.cep,
            rua: formData.rua,
            numero: formData.numero,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
            complemento: formData.complemento,
            type: clientType,
            created_at: new Date().toISOString()
        };

        try {
            // Tenta enviar direto pro Supabase se estiver online
            let syncStatus = SYNC_STATUS.PENDING_CREATE;

            const { data, error } = await supabase.from('clients')
                .insert([clientData])
                .select();

            if (!error && data) {
                syncStatus = SYNC_STATUS.SYNCED;
                clientData.id = data[0].id; // Usa o ID gerado pelo banco
                console.log("✅ Cliente salvo diretamente no servidor!");
            } else {
                console.warn("⚠️ Falha no envio direto, salvando localmente para sync posterior:", error);
            }

            // Salva no Dexie (seja como SYNCED ou PENDING)
            await db.clients.add({
                ...clientData,
                sync_status: syncStatus
            });

            onSave();
            if (syncStatus === SYNC_STATUS.PENDING_CREATE) syncWithServer();
        } catch (error) {
            console.error("Erro ao processar salvamento de cliente:", error);
            // Fallback total para Dexie local
            await db.clients.add({
                ...clientData,
                sync_status: SYNC_STATUS.PENDING_CREATE
            });
            onSave();
            syncWithServer();
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
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Cadastrar Cliente</h2>
                        <button onClick={onClose} style={{ border: 'none', background: 'var(--ios-bg)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                            <X size={20} color="var(--text-secondary)" />
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', background: 'var(--ios-bg)', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
                        <button
                            onClick={() => setClientType('PF')}
                            style={{
                                flex: 1, border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                background: clientType === 'PF' ? 'var(--color-surface)' : 'transparent',
                                color: clientType === 'PF' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                fontWeight: 700, transition: '0.2s',
                                boxShadow: clientType === 'PF' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Pessoa Física
                        </button>
                        <button
                            onClick={() => setClientType('PJ')}
                            style={{
                                flex: 1, border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                background: clientType === 'PJ' ? 'var(--color-surface)' : 'transparent',
                                color: clientType === 'PJ' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                fontWeight: 700, transition: '0.2s',
                                boxShadow: clientType === 'PJ' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Pessoa Jurídica
                        </button>
                    </div>

                    <form layout="vertical" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>NOME COMPLETO OU RAZÃO SOCIAL</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                    {clientType === 'PJ' ? <Building2 size={18} /> : <User size={18} />}
                                </div>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                    placeholder={clientType === 'PJ' ? 'Ex: Manutenção ME' : 'Ex: João da Silva'}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#8E8E93', marginBottom: '8px', marginLeft: '4px' }}>{clientType === 'PJ' ? 'CNPJ' : 'CPF'}</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                    <FileText size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.documento}
                                    onChange={e => setFormData({ ...formData, documento: applyMask(e.target.value, clientType === 'PJ' ? 'CNPJ' : 'CPF') })}
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                    placeholder={clientType === 'PJ' ? '00.000.000/0001-00' : '000.000.000-00'}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#8E8E93', marginBottom: '8px', marginLeft: '4px' }}>EMAIL</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid #E5E5EA', background: '#F9F9F9', fontSize: '15px' }}
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#8E8E93', marginBottom: '8px', marginLeft: '4px' }}>TELEFONE</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.telefone}
                                        onChange={e => setFormData({ ...formData, telefone: applyMask(e.target.value, 'Phone') })}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px' }}
                                        placeholder="(00) 0 0000-0000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Endereço Completo</h3>

                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>CEP</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }}>
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        className="cep-input"
                                        value={formData.cep}
                                        onChange={(e) => {
                                            const masked = applyMask(e.target.value, 'CEP');
                                            setFormData(prev => ({ ...prev, cep: masked }));
                                            const clean = masked.replace(/\D/g, '');
                                            if (clean.length === 8) handleCepSearch(clean);
                                        }}
                                        style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '14px' }}
                                        placeholder="00000-000"
                                    />
                                    {loadingCep && <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} className="spin-small">...</div>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>RUA</label>
                                    <input
                                        type="text"
                                        value={formData.rua}
                                        disabled
                                        style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', fontSize: '14px', color: 'var(--text-secondary)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>Nº</label>
                                    <input
                                        type="text"
                                        value={formData.numero}
                                        onChange={e => setFormData({ ...formData, numero: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '14px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>BAIRRO</label>
                                    <input type="text" value={formData.bairro} disabled style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', fontSize: '14px', color: 'var(--text-secondary)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>CIDADE/UF</label>
                                    <input type="text" value={formData.cidade ? `${formData.cidade} - ${formData.estado}` : ''} disabled style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--ios-bg)', fontSize: '14px', color: 'var(--text-secondary)' }} />
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
                            <span>Confirmar Cadastro</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddClientModal;
