import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Box, Settings, Cpu, Calendar,
    ChevronRight, Info, Wrench, Building2, Clock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AddMachineModal from '../components/AddMachineModal';
import './Machinery.css';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';

const Machinery = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { isOnline } = useSync();

    // Buscar dados do Dexie (reativo)
    const machines = useLiveQuery(
        () => db.machinery
            .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.serial.toLowerCase().includes(searchQuery.toLowerCase()))
            .toArray(),
        [searchQuery]
    );

    const handleMachineClick = (id) => {
        navigate(`/maquinario/${id}`);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                <header className="home-header">
                    <div className="header-top">
                        <h2 className="greeting">Maquinário</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#34C759' : '#FF3B30' }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    <div className="dashboard-actions-row" style={{ marginTop: '24px' }}>
                        <div className="filter-card" style={{ flex: 1 }}>
                            <div className="filter-icon-wrapper"><Search size={18} /></div>
                            <input
                                type="text"
                                className="month-selector-input"
                                placeholder="Buscar máquina por nome, modelo ou série..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }}
                            />
                        </div>

                        <div className="action-buttons-group">
                            <button className="generate-report-btn" onClick={() => setIsAddModalOpen(true)}>
                                <Plus size={18} />
                                <span>Nova Máquina</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="machinery-container fade-in">
                    {!machines ? (
                        <div className="loader-container">Carregando...</div>
                    ) : (
                        <div className="machinery-grid">
                            {machines.map(machine => (
                                <div key={machine.id} className="machine-card" onClick={() => handleMachineClick(machine.id)}>
                                    <div className="machine-card-header">
                                        <div className="machine-icon-wrapper">
                                            <Box size={24} />
                                        </div>
                                        <span className={`machine-status-badge ${machine.status}`}>
                                            {machine.status === 'active' ? 'Operacional' : 'Manutenção'}
                                        </span>
                                    </div>

                                    <h3 className="machine-name">{machine.name}</h3>

                                    <div className="machine-info-item">
                                        <Cpu size={16} />
                                        <span>Modelo: {machine.model}</span>
                                    </div>

                                    <div className="machine-info-item">
                                        <Settings size={16} />
                                        <span>Serial: {machine.serial}</span>
                                    </div>

                                    <div className="machine-info-item">
                                        <Building2 size={16} />
                                        <span>Cliente: {machine.client}</span>
                                    </div>

                                    <div className="machine-card-footer">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {machine.sync_status !== 'synced' && <Clock size={14} color="#FF9500" />}
                                            <span style={{ fontSize: '11px', color: machine.sync_status !== 'synced' ? '#FF9500' : 'var(--text-secondary)' }}>
                                                {machine.sync_status === 'synced' ? 'Sincronizado' : 'Aguardando rede'}
                                            </span>
                                        </div>
                                        <div className="view-details-link">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <AddMachineModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default Machinery;
