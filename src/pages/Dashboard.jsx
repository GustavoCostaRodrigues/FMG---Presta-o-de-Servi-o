import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, CheckCircle2, Clock, Search, X, Menu, Eye, FileText, Filter, Pencil, Wallet, Trash2, Info, Wrench, Users, Box
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';
import { generateServiceReport } from '../utils/pdfGenerator';
import AddServiceModal from '../components/AddServiceModal';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { isOnline, syncWithServer } = useSync();

    const userName = "Gustavo";
    const [selectedFilter, setSelectedFilter] = useState('all');

    const availableMonths = useLiveQuery(async () => {
        const services = await db.services.toArray();
        const months = new Set();
        services.forEach(s => {
            const d = new Date(s.date);
            if (!isNaN(d.getTime())) {
                months.add(`${d.getMonth() + 1}-${d.getFullYear()}`);
            }
        });
        return Array.from(months).sort((a, b) => {
            const [m1, y1] = a.split('-').map(Number);
            const [m2, y2] = b.split('-').map(Number);
            return y2 - y1 || m2 - m1;
        });
    }) || [];

    const getFilterOptions = () => {
        const options = [{ value: 'all', label: 'Todos os Serviços' }];
        availableMonths.forEach(monthYear => {
            const [month, year] = monthYear.split('-').map(Number);
            const d = new Date(year, month - 1, 1);
            const monthLabel = format(d, 'MMMM / yyyy', { locale: ptBR });
            options.push({
                value: monthYear,
                label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
            });
        });
        return options;
    };

    const filterOptions = getFilterOptions();

    // Buscar estatísticas reais do Dexie
    const servicesCount = useLiveQuery(() => db.services.count()) || 0;
    const clientsCount = useLiveQuery(() => db.clients.count()) || 0;
    const machinesCount = useLiveQuery(() => db.machinery.count()) || 0;

    // Buscar serviços com base no filtro
    const services = useLiveQuery(
        async () => {
            if (selectedFilter === 'all') {
                return db.services.orderBy('date').reverse().limit(50).toArray();
            }
            const [month, year] = selectedFilter.split('-').map(Number);
            const startDate = new Date(year, month - 1, 1).toISOString();
            const endDate = new Date(year, month, 1).toISOString();

            return db.services
                .where('date')
                .between(startDate, endDate)
                .reverse()
                .toArray();
        },
        [selectedFilter]
    ) || [];

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);


    const handleGenerateReport = () => {
        const filterLabel = filterOptions.find(opt => opt.value === selectedFilter)?.label || 'Geral';
        generateServiceReport({
            title: `Resumo de Atividades - ${filterLabel}`,
            subtitle: `Total de ${services.length} registros encontrados`,
            type: 'Período',
            data: services,
            filename: `relatorio-dashboard-${selectedFilter}.pdf`
        });
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                <header className="home-header">
                    <div className="header-top">
                        <h2 className="greeting">Olá, {userName}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ios-bg)', padding: '6px 12px', borderRadius: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#34C759' : '#FF3B30' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {isOnline ? 'Conectado (Cloud)' : 'Modo Offline'}
                            </span>
                        </div>
                    </div>

                    <div className="summary-cards-row">
                        {/* KPI 1: SERVIÇOS */}
                        <div className="balance-card secondary-card">
                            <div className="card-header-flex">
                                <p className="balance-label"><Wrench size={16} /> Serviços Prestados</p>
                            </div>
                            <h1 className="balance-value">{servicesCount}</h1>
                            <p className="balance-subtitle text-secondary">Total histórico</p>
                        </div>

                        {/* KPI 2: CLIENTES */}
                        <div className="balance-card secondary-card">
                            <div className="card-header-flex">
                                <p className="balance-label"><Users size={16} /> Clientes Cadastrados</p>
                            </div>
                            <h1 className="balance-value">{clientsCount}</h1>
                            <p className="balance-subtitle text-secondary">Base ativa</p>
                        </div>

                        {/* KPI 3: MÁQUINAS (PURPLE) */}
                        <div className="balance-card">
                            <p className="balance-label"><Box size={16} /> Máquinas Ativas</p>
                            <h1 className="balance-value">{machinesCount}</h1>
                            <p className="balance-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>Equipamentos sob gestão</p>
                        </div>
                    </div>

                </header>

                <div className="dashboard-actions-row">
                    <div className="filter-card">
                        <div className="filter-icon-wrapper"><Filter size={18} /></div>
                        <select
                            className="month-selector-input"
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                        >
                            {filterOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="action-buttons-group">
                        <button className="generate-report-btn" onClick={() => setIsAddModalOpen(true)} style={{ background: 'var(--brand-primary)', color: '#FFFFFF' }}>
                            <Plus size={18} />
                            <span>Nova Prestação</span>
                        </button>
                        <button className="generate-report-btn" onClick={handleGenerateReport}>
                            <FileText size={18} />
                            <span>Relatório PDF</span>
                        </button>
                    </div>
                </div>

                <section className="bills-section fade-in">
                    <div className="section-title">
                        <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>
                            Relatório de Serviços Prestados
                        </h3>
                    </div>

                    <div className="bills-list">
                        {services.length === 0 ? (
                            <div className="no-data-placeholder">Nenhum serviço registrado recentemente.</div>
                        ) : (
                            services.map(item => (
                                <div key={item.id} className="bill-card">
                                    <div className={`bill-status-indicator ${item.status === 'paid' ? 'paid' : 'pending'}`}>
                                        {item.status === 'paid' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                    </div>

                                    <div className="bill-info-group">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="bill-title">{item.id} - {item.title}</span>
                                            {item.sync_status !== 'synced' && <Clock size={12} color="#FF9500" />}
                                        </div>
                                        <span className="bill-date">Status Sincronização: {item.sync_status === 'synced' ? 'Nuvem' : 'Local'}</span>
                                        <span className="bill-created">Executado em: {format(new Date(item.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                                    </div>

                                    <div className="bill-amount-group">
                                        <span className="bill-amount">{formatCurrency(item.valor)}</span>
                                    </div>

                                    <div className="bill-actions">
                                        <button className="view-receipt-btn">
                                            <Eye size={16} /> <span>Visualizar</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <AddServiceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;
