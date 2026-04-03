import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, SYNC_STATUS } from '../lib/db';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);

    // Monitorar status da rede
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Puxar dados do servidor para o banco local
    const pullFromServer = useCallback(async () => {
        if (!isOnline || !isAuthenticated) return;

        try {
            console.log('Puxando dados do servidor...');

            // Puxar todas as tabelas em paralelo
            const [
                { data: clients },
                { data: machinery },
                { data: collaborators },
                { data: serviceTypes },
                { data: services }
            ] = await Promise.all([
                supabase.from('clients').select('*'),
                supabase.from('machinery').select('*'),
                supabase.from('collaborators').select('*'),
                supabase.from('service_types').select('*'),
                supabase.from('services').select('*')
            ]);

            // Atualizar Dexie (apenas se não houver erro no fetch)
            if (clients) await db.clients.bulkPut(clients.map(c => ({ ...c, sync_status: SYNC_STATUS.SYNCED })));
            if (machinery) await db.machinery.bulkPut(machinery.map(m => ({ ...m, sync_status: SYNC_STATUS.SYNCED })));
            if (collaborators) await db.collaborators.bulkPut(collaborators.map(c => ({ ...c, sync_status: SYNC_STATUS.SYNCED })));
            if (serviceTypes) await db.service_types.bulkPut(serviceTypes.map(t => ({ ...t, sync_status: SYNC_STATUS.SYNCED })));
            if (services) await db.services.bulkPut(services.map(s => ({ ...s, sync_status: SYNC_STATUS.SYNCED })));

            console.log('✅ Dados atualizados com o servidor!');
            setLastSync(new Date());
        } catch (error) {
            console.error('❌ Falha ao puxar dados:', error);
        }
    }, [isOnline, isAuthenticated]);

    // Sincronizar alterações pendentes com o servidor
    const syncWithServer = useCallback(async () => {
        if (!isOnline || isSyncing || !isAuthenticated) return;

        try {
            setIsSyncing(true);
            console.log('Iniciando sincronização...');

            // 1. Sincronizar Clientes
            const pendingClients = await db.clients
                .filter(c => c.sync_status !== SYNC_STATUS.SYNCED)
                .toArray();

            if (pendingClients.length > 0) {
                console.log(`Sincronizando ${pendingClients.length} clientes...`);
                const { error } = await supabase.rpc('sync_clients', { p_clients: pendingClients });
                if (error) throw error;
                await Promise.all(pendingClients.map(c =>
                    db.clients.update(c.id, { sync_status: SYNC_STATUS.SYNCED })
                ));
            }

            // 2. Sincronizar Maquinário
            const pendingMachinery = await db.machinery
                .filter(m => m.sync_status !== SYNC_STATUS.SYNCED)
                .toArray();

            if (pendingMachinery.length > 0) {
                console.log(`Sincronizando ${pendingMachinery.length} máquinas...`);
                const { error } = await supabase.rpc('sync_machinery', { p_machinery: pendingMachinery });
                if (error) throw error;
                await Promise.all(pendingMachinery.map(m =>
                    db.machinery.update(m.id, { sync_status: SYNC_STATUS.SYNCED })
                ));
            }

            // 3. Sincronizar Colaboradores
            const pendingColabs = await db.collaborators
                .filter(c => c.sync_status !== SYNC_STATUS.SYNCED)
                .toArray();

            if (pendingColabs.length > 0) {
                console.log(`Sincronizando ${pendingColabs.length} colaboradores...`);
                const { error } = await supabase.rpc('sync_collaborators', { p_collaborators: pendingColabs });
                if (error) throw error;
                await Promise.all(pendingColabs.map(c =>
                    db.collaborators.update(c.id, { sync_status: SYNC_STATUS.SYNCED })
                ));
            }

            // 4. Sincronizar Tipos de Serviço
            const pendingTypes = await db.service_types
                .filter(t => t.sync_status !== SYNC_STATUS.SYNCED)
                .toArray();

            if (pendingTypes.length > 0) {
                console.log(`Sincronizando ${pendingTypes.length} tipos de serviço...`);
                const { error } = await supabase.rpc('sync_service_types', { p_types: pendingTypes });
                if (error) throw error;
                await Promise.all(pendingTypes.map(t =>
                    db.service_types.update(t.id, { sync_status: SYNC_STATUS.SYNCED })
                ));
            }

            // 5. Sincronizar Serviços (OS)
            const pendingServices = await db.services
                .filter(s => s.sync_status !== SYNC_STATUS.SYNCED)
                .toArray();

            if (pendingServices.length > 0) {
                console.log(`Sincronizando ${pendingServices.length} serviços...`);
                const { error } = await supabase.rpc('sync_services', { p_services: pendingServices });
                if (error) throw error;
                await Promise.all(pendingServices.map(s =>
                    db.services.update(s.id, { sync_status: SYNC_STATUS.SYNCED })
                ));
            }

            // Após empurrar, puxar novidades
            await pullFromServer();

            console.log('✅ Sincronização completa concluída!');
            setLastSync(new Date());
        } catch (error) {
            console.error('❌ Falha na sincronização:', error);
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline, isSyncing, pullFromServer, isAuthenticated]);

    // Tentar sincronizar quando voltar online ou logar
    useEffect(() => {
        if (isOnline && isAuthenticated) {
            syncWithServer();
        }
    }, [isOnline, isAuthenticated, syncWithServer]);

    return (
        <SyncContext.Provider value={{ isOnline, isSyncing, lastSync, syncWithServer, pullFromServer }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => useContext(SyncContext);
