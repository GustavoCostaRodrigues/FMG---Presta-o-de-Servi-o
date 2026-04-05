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
    const syncInProgressRef = React.useRef(false);

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

            // 1. Limpar registros locais que já foram sincronizados (para evitar duplicidade ou lixo)
            // Isso garante que se o servidor estiver vazio, o local também ficará (espelhamento real)
            await Promise.all([
                db.clients.where('sync_status').equals(SYNC_STATUS.SYNCED).delete(),
                db.machinery.where('sync_status').equals(SYNC_STATUS.SYNCED).delete(),
                db.collaborators.where('sync_status').equals(SYNC_STATUS.SYNCED).delete(),
                db.service_types.where('sync_status').equals(SYNC_STATUS.SYNCED).delete(),
                db.services.where('sync_status').equals(SYNC_STATUS.SYNCED).delete()
            ]);

            // 2. Inserir dados frescos do servidor
            if (clients?.length > 0) await db.clients.bulkAdd(clients.map(c => ({ ...c, sync_status: SYNC_STATUS.SYNCED })));
            if (machinery?.length > 0) await db.machinery.bulkAdd(machinery.map(m => ({ ...m, sync_status: SYNC_STATUS.SYNCED })));
            if (collaborators?.length > 0) await db.collaborators.bulkAdd(collaborators.map(c => ({ ...c, sync_status: SYNC_STATUS.SYNCED })));
            if (serviceTypes?.length > 0) await db.service_types.bulkAdd(serviceTypes.map(t => ({ ...t, sync_status: SYNC_STATUS.SYNCED })));
            if (services?.length > 0) await db.services.bulkAdd(services.map(s => ({ ...s, sync_status: SYNC_STATUS.SYNCED })));

            console.log('✅ Dados atualizados com o servidor!');
            setLastSync(new Date());
        } catch (error) {
            console.error('❌ Falha ao puxar dados:', error);
        }
    }, [isOnline, isAuthenticated]);

    // Sincronizar alterações pendentes com o servidor
    const syncWithServer = useCallback(async () => {
        if (!isOnline || isSyncing || !isAuthenticated || syncInProgressRef.current) return;

        try {
            syncInProgressRef.current = true;
            setIsSyncing(true);
            console.log('Iniciando sincronização...');

            // Função auxiliar para deletar registros no Supabase
            const processDeletions = async (tableName, storeName) => {
                const toDelete = await db[storeName]
                    .filter(item => item.sync_status === SYNC_STATUS.PENDING_DELETE)
                    .toArray();

                if (toDelete.length > 0) {
                    console.log(`Excluindo ${toDelete.length} registros de ${tableName} no servidor...`);
                    for (const item of toDelete) {
                        const { error } = await supabase.from(tableName).delete().eq('id', item.id);
                        if (!error || error.code === 'PGRST116') {
                            await db[storeName].delete(item.id);
                        } else {
                            console.error(`Erro ao excluir ${tableName} ${item.id}:`, error);
                        }
                    }
                }
            };

            // 0. Processar Exclusões Pendentes
            await processDeletions('clients', 'clients');
            await processDeletions('machinery', 'machinery');
            await processDeletions('collaborators', 'collaborators');
            await processDeletions('service_types', 'service_types');
            await processDeletions('services', 'services');

            // 1. Sincronizar Clientes
            try {
                const pendingClients = await db.clients
                    .filter(c => [SYNC_STATUS.PENDING_CREATE, SYNC_STATUS.PENDING_UPDATE].includes(c.sync_status))
                    .toArray();
                if (pendingClients.length > 0) {
                    console.log(`Sincronizando ${pendingClients.length} clientes...`);
                    const { error } = await supabase.rpc('sync_clients', { p_clients: pendingClients });
                    if (error) throw error;
                    await Promise.all(pendingClients.map(c =>
                        db.clients.update(c.id, { sync_status: SYNC_STATUS.SYNCED })
                    ));
                }
            } catch (err) {
                console.error('Erro ao sincronizar clientes:', err);
            }

            // 2. Sincronizar Maquinário
            try {
                const pendingMachinery = await db.machinery
                    .filter(m => [SYNC_STATUS.PENDING_CREATE, SYNC_STATUS.PENDING_UPDATE].includes(m.sync_status))
                    .toArray();
                if (pendingMachinery.length > 0) {
                    console.log(`Sincronizando ${pendingMachinery.length} máquinas...`);
                    const { error } = await supabase.rpc('sync_machinery', { p_machinery: pendingMachinery });
                    if (error) throw error;
                    await Promise.all(pendingMachinery.map(m =>
                        db.machinery.update(m.id, { sync_status: SYNC_STATUS.SYNCED })
                    ));
                }
            } catch (err) {
                console.error('Erro ao sincronizar maquinário:', err);
            }

            // 3. Sincronizar Colaboradores
            try {
                const pendingColabs = await db.collaborators
                    .filter(c => [SYNC_STATUS.PENDING_CREATE, SYNC_STATUS.PENDING_UPDATE].includes(c.sync_status))
                    .toArray();
                if (pendingColabs.length > 0) {
                    console.log(`Sincronizando ${pendingColabs.length} colaboradores...`);
                    const { error } = await supabase.rpc('sync_collaborators', { p_collaborators: pendingColabs });
                    if (error) throw error;
                    await Promise.all(pendingColabs.map(c =>
                        db.collaborators.update(c.id, { sync_status: SYNC_STATUS.SYNCED })
                    ));
                }
            } catch (err) {
                console.error('Erro ao sincronizar colaboradores:', err);
            }

            // 4. Sincronizar Tipos de Serviço
            try {
                const pendingTypes = await db.service_types
                    .filter(t => [SYNC_STATUS.PENDING_CREATE, SYNC_STATUS.PENDING_UPDATE].includes(t.sync_status))
                    .toArray();
                if (pendingTypes.length > 0) {
                    console.log(`Sincronizando ${pendingTypes.length} tipos de serviço...`);
                    const { error } = await supabase.rpc('sync_service_types', { p_types: pendingTypes });
                    if (error) throw error;
                    await Promise.all(pendingTypes.map(t =>
                        db.service_types.update(t.id, { sync_status: SYNC_STATUS.SYNCED })
                    ));
                }
            } catch (err) {
                console.error('Erro ao sincronizar tipos de serviço:', err);
            }

            // 5. Sincronizar Serviços (OS)
            try {
                const pendingServices = await db.services
                    .filter(s => [SYNC_STATUS.PENDING_CREATE, SYNC_STATUS.PENDING_UPDATE].includes(s.sync_status))
                    .toArray();

                if (pendingServices.length > 0) {
                    console.log(`Sincronizando ${pendingServices.length} serviços...`, pendingServices);
                    const { error } = await supabase.rpc('sync_services', { p_services: pendingServices });
                    if (error) {
                        console.error('Erro detalhado RPC sync_services:', error);
                        throw error;
                    }
                    await Promise.all(pendingServices.map(s =>
                        db.services.update(s.id, { sync_status: SYNC_STATUS.SYNCED })
                    ));
                }
            } catch (err) {
                console.error('Erro ao sincronizar serviços:', err);
            }

            // Após empurrar, puxar novidades
            await pullFromServer();

            console.log('✅ Sincronização completa concluída!');
            setLastSync(new Date());
        } catch (error) {
            console.error('❌ Falha na sincronização:', error);
            if (error.message) console.error('Mensagem de erro:', error.message);
            if (error.details) console.error('Detalhes do erro:', error.details);
            if (error.hint) console.error('Dica:', error.hint);
        } finally {
            setIsSyncing(false);
            syncInProgressRef.current = false;
        }
    }, [isOnline, pullFromServer, isAuthenticated]);

    // Tentar sincronizar quando voltar online, logar ou mudar visibilidade (voltar para a aba)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isOnline && isAuthenticated) {
                console.log('Aba visível, acionando sincronização...');
                syncWithServer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        if (isOnline && isAuthenticated) {
            syncWithServer();
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isOnline, isAuthenticated, syncWithServer]);

    // Loop de sincronização periódica (cada 30 segundos)
    useEffect(() => {
        let interval = null;

        if (isOnline && isAuthenticated) {
            interval = setInterval(() => {
                console.log('Sincronização periódica iniciada...');
                syncWithServer();
            }, 30000); // 30 segundos
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOnline, isAuthenticated, syncWithServer]);

    return (
        <SyncContext.Provider value={{ isOnline, isSyncing, lastSync, syncWithServer, pullFromServer }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => useContext(SyncContext);
