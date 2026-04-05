import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Clock, User, CheckCircle2, MoreVertical, Plus
} from 'lucide-react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays,
    eachDayOfInterval, isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Sidebar from '../components/Sidebar';
import AddServiceModal from '../components/AddServiceModal';
import ServiceDetailModal from '../components/ServiceDetailModal';
import { db, SYNC_STATUS } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSync } from '../context/SyncContext';
import './Agenda.css';

const Agenda = () => {
    const [view, setView] = useState('month'); // 'month', 'week', 'day'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isOnline } = useSync();

    // Buscar serviços reais do Banco de dados
    const services = useLiveQuery(async () => {
        try {
            const items = await db.services.filter(s => s.sync_status !== SYNC_STATUS.PENDING_DELETE).toArray();
            const enrichedItems = await Promise.all(items.map(async (s) => {
                try {
                    const client = s.client_id ? await db.clients.get(s.client_id) : null;
                    const machine = s.machine_id ? await db.machinery.get(s.machine_id) : null;
                    const collaborator = s.technician_id ? await db.collaborators.get(s.technician_id) : null;
                    const serviceType = s.service_type_id ? await db.service_types.get(s.service_type_id) : null;

                    const serviceDate = s.date ? new Date(s.date) : new Date();

                    return {
                        ...s,
                        clientName: client?.name || 'Cliente Removido',
                        machineName: machine?.name || 'Máquina Removida',
                        collaboratorName: collaborator?.name || 'Técnico',
                        serviceTypeName: serviceType?.name || 'Serviço',
                        date: isNaN(serviceDate.getTime()) ? new Date() : serviceDate
                    };
                } catch (err) {
                    console.error("Error enriching service:", s, err);
                    return { ...s, date: new Date(), clientName: 'Erro', machineName: 'Erro' };
                }
            }));
            return enrichedItems;
        } catch (error) {
            console.error("Error fetching services for agenda:", error);
            return [];
        }
    }) || [];

    const [selectedService, setSelectedService] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const nextDate = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prevDate = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addDays(currentDate, -7));
        else setCurrentDate(addDays(currentDate, -1));
    };

    const renderHeader = () => {
        let label = '';
        if (view === 'month') label = format(currentDate, 'MMMM yyyy', { locale: ptBR });
        else if (view === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 0 });
            const end = endOfWeek(currentDate, { weekStartsOn: 0 });
            label = `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
        } else label = format(currentDate, "dd 'de' MMMM yyyy", { locale: ptBR });

        return (
            <div className="agenda-header">
                <div className="agenda-header-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div className="agenda-title-group">
                        <p style={{ color: 'var(--brand-primary)', fontWeight: 800, margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Planejamento</p>
                    </div>

                    <div className="view-controls">
                        <button className={`view-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Mensal</button>
                        <button className={`view-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Semanal</button>
                        <button className={`view-btn ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>Diária</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="date-nav">
                            <button className="nav-btn" onClick={prevDate}><ChevronLeft size={18} /></button>
                            <span className="current-date-label">{label}</span>
                            <button className="nav-btn" onClick={nextDate}><ChevronRight size={18} /></button>
                        </div>

                        <button className="generate-report-btn" onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} /> <span>Novo Evento</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        const rows = [];
        let days = [];
        calendarDays.forEach((day, i) => {
            days.push(day);
            if ((i + 1) % 7 === 0) {
                rows.push(days);
                days = [];
            }
        });

        return (
            <div className="calendar-grid fade-in">
                <div className="day-names-row">
                    {dayNames.map(day => <div key={day} className="day-name">{day}</div>)}
                </div>
                <div className="calendar-rows">
                    {rows.map((week, rowIndex) => (
                        <div key={rowIndex} className="calendar-row">
                            {week.map(day => {
                                const dayServices = services.filter(s => isSameDay(s.date, day));
                                return (
                                    <div
                                        key={day.toString()}
                                        className={`day-cell ${!isSameMonth(day, monthStart) ? 'other-month' : ''} ${isToday(day) ? 'today' : ''}`}
                                        onClick={() => { setCurrentDate(day); setView('day'); }}
                                    >
                                        <span className="day-number">{format(day, 'd')}</span>
                                        <div className="service-dots" style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', marginTop: '4px' }}>
                                            {dayServices.map(s => {
                                                const truncatedTitle = s.serviceTypeName?.length > 22 ? s.serviceTypeName.substring(0, 20) + '...' : s.serviceTypeName;
                                                return (
                                                    <div
                                                        key={s.id}
                                                        className="calendar-service-card"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedService(s);
                                                            setIsDetailModalOpen(true);
                                                        }}
                                                    >
                                                        <span className="calendar-service-title">{truncatedTitle}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayServices = services.filter(s => isSameDay(s.date, currentDate));
        const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00

        return (
            <div className="schedule-container fade-in">
                {hours.map(hour => {
                    const serviceAtHour = dayServices.find(s => s.date.getHours() === hour);
                    return (
                        <div key={hour} className="schedule-row">
                            <div className="time-col">{hour}:00</div>
                            <div className="events-col">
                                {serviceAtHour && (
                                    <div
                                        className="service-card-mini"
                                        onClick={() => {
                                            setSelectedService(serviceAtHour);
                                            setIsDetailModalOpen(true);
                                        }}
                                    >
                                        <div className="service-card-title">
                                            {serviceAtHour.serviceTypeName?.length > 45 ? serviceAtHour.serviceTypeName.substring(0, 42) + '...' : serviceAtHour.serviceTypeName}
                                        </div>
                                        <div className="service-card-client">
                                            <User size={12} /> {serviceAtHour.clientName} • <Clock size={12} /> {serviceAtHour.duration || 'N/A'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeekView = () => {
        const start = startOfWeek(currentDate);
        const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
        const hours = Array.from({ length: 14 }, (_, i) => i + 7);

        return (
            <div className="schedule-container fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="week-grid">
                    <div className="time-col" style={{ borderBottom: '1px solid #F2F2F7', background: 'rgba(0,0,0,0.02)' }}></div>
                    {days.map(day => (
                        <div key={day.toString()} className="week-header-day" style={{ backgroundColor: isToday(day) ? 'rgba(0, 135, 94, 0.05)' : 'transparent' }}>
                            <span className="week-header-label">{format(day, 'EEE', { locale: ptBR })}</span>
                            <span className="week-header-num">{format(day, 'd')}</span>
                        </div>
                    ))}

                    {hours.map(hour => (
                        <React.Fragment key={hour}>
                            <div className="time-col">{hour}:00</div>
                            {days.map(day => {
                                const service = services.find(s => isSameDay(s.date, day) && s.date.getHours() === hour);
                                return (
                                    <div key={`${day}-${hour}`} className="events-col" style={{ borderLeft: '1px solid #F2F2F7', borderBottom: '1px solid #F2F2F7' }}>
                                        {service && (
                                            <div
                                                className="service-card-mini"
                                                style={{ padding: '6px' }}
                                                onClick={() => {
                                                    setSelectedService(service);
                                                    setIsDetailModalOpen(true);
                                                }}
                                            >
                                                <div className="service-card-title" style={{ fontSize: '10px' }}>
                                                    {service.serviceTypeName?.length > 25 ? service.serviceTypeName.substring(0, 22) + '...' : service.serviceTypeName}
                                                </div>
                                                <div className="service-card-client" style={{ fontSize: '9px' }}>{service.clientName}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="layout-container">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="main-content">
                <header className="home-header">
                    <div className="header-top">
                        <h2 className="greeting">Agenda Técnica</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ios-bg)', padding: '6px 12px', borderRadius: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#34C759' : '#FF3B30' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="agenda-container page-content" style={{ paddingTop: 0 }}>
                    {renderHeader()}
                    <div className="agenda-body">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view + currentDate.toString()}
                                className="view-wrapper"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                            >
                                {view === 'month' && renderMonthView()}
                                {view === 'week' && renderWeekView()}
                                {view === 'day' && renderDayView()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <AddServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => setIsModalOpen(false)}
            />

            <ServiceDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                service={selectedService}
            />
        </div>
    );
};

export default Agenda;
