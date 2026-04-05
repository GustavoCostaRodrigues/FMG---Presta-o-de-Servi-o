import React, { useState } from 'react';
import { Plus, Trash2, Sliders, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { db, SYNC_STATUS } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';

const Settings = () => {
    const { syncWithServer } = useSync();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newType, setNewType] = useState('');
    const allTypes = useLiveQuery(() => db.service_types.toArray()) || [];
    const types = allTypes.filter(t => t.sync_status !== SYNC_STATUS.PENDING_DELETE);

    const handleAddType = async () => {
        if (!newType.trim()) return;
        try {
            await db.service_types.add({
                name: newType.trim(),
                sync_status: SYNC_STATUS.PENDING_CREATE,
                created_at: new Date().toISOString()
            });
            setNewType('');
            syncWithServer(); // Sincronismo imediato se online
        } catch (error) {
            console.error("Erro ao adicionar tipo:", error);
        }
    };

    const handleDeleteType = async (id) => {
        const type = await db.service_types.get(id);
        if (!type) return;

        try {
            // Se for novo e ainda não sincronizou, pode deletar direto
            if (type.sync_status === SYNC_STATUS.PENDING_CREATE && !type.id.toString().includes('-')) {
                // IDs numéricos vêm do Dexie, mas o server os gera como bigint.
                // Na vdd, o ideal é marcar como PENDING_DELETE de qualquer forma se tiver ID no server.
                // Mas se for puramente local, deleta direto.
                await db.service_types.delete(id);
            } else {
                await db.service_types.update(id, { sync_status: SYNC_STATUS.PENDING_DELETE });
            }
            syncWithServer(); // Sincronismo imediato se online
        } catch (error) {
            console.error("Erro ao excluir tipo:", error);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                <header className="home-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Configurações do Sistema</span>
                    </div>
                    <h2 className="greeting">Ajustes</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Gerencie as preferências e parâmetros do seu software.</p>
                </header>

                <div className="dashboard-grid" style={{ marginTop: '32px' }}>
                    {/* Service Types Management Section */}
                    <section className="card fade-in" style={{ padding: '32px', gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ backgroundColor: 'var(--ios-bg)', padding: '14px', borderRadius: '18px', color: 'var(--brand-primary)' }}>
                                <Sliders size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Tipos de Serviço</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Cadastre as modalidades de serviços que sua empresa presta.</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px', maxWidth: '600px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#8E8E93', marginBottom: '12px', textTransform: 'uppercase' }}>Adicionar Novo Tipo</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="text"
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    placeholder="Ex: Revisão de 500h, Troca de Óleo..."
                                    style={{
                                        flex: 1, padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--border-color)',
                                        background: 'var(--ios-bg)', color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
                                />
                                <button
                                    onClick={handleAddType}
                                    style={{
                                        padding: '0 24px', borderRadius: '18px', border: 'none',
                                        background: 'var(--brand-primary)', color: '#FFFFFF', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                                        boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb), 0.2)'
                                    }}
                                >
                                    <Plus size={22} style={{ marginRight: '8px' }} />
                                    <span>Cadastrar</span>
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                            {types.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: 'var(--ios-bg)', borderRadius: '24px', border: '2px dashed var(--border-color)' }}>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Nenhum tipo de serviço cadastrado.</p>
                                </div>
                            ) : (
                                types.map(type => (
                                    <div
                                        key={type.id}
                                        className="item-card"
                                        style={{
                                            padding: '20px', borderRadius: '20px', backgroundColor: 'var(--ios-bg)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            border: '1px solid transparent', transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)' }} />
                                            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{type.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteType(type.id)}
                                            style={{ border: 'none', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', cursor: 'pointer', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Excluir tipo"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Settings;
