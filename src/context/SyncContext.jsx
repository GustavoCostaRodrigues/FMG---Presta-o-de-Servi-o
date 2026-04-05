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

            const safeMerge = async (storeName, serverItems) => {
                if (!serverItems) return;

                // 1. Identificar registros locais que estão marcados como sincronizados
                // mas não existem mais no servidor (foram deletados por outro usuário)
                const localSyncedItems = await db[storeName]
                    .filter(item => item.sync_status === SYNC_STATUS.SYNCED)
                    .toArray();

                const serverIds = new Set(serverItems.map(s => s.id.toString()));

                for (const local of localSyncedItems) {
                    if (!serverIds.has(local.id.toString())) {
                        await db[storeName].delete(local.id);
                    }
                }

                // 2. Mesclar itens do servidor com o local
                for (const item of serverItems) {
                    const local = await db[storeName].get(item.id);
                    // Só sobrescreve se o local não existir OU se estiver sincronizado (sem alterações pendentes)
                    if (!local || local.sync_status === SYNC_STATUS.SYNCED) {
                        await db[storeName].put({ ...item, sync_status: SYNC_STATUS.SYNCED });
                    }
                }
            };

            await Promise.all([
                safeMerge('clients', clients),
                safeMerge('machinery', machinery),
                safeMerge('collaborators', collaborators),
                safeMerge('service_types', serviceTypes),
                safeMerge('services', services)
            ]);

            console.log('✅ Dados mesclados com o servidor (respeitando estados de sync)');
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
                    console.group('🔍 Diagnóstico Sincronização de Serviços');
                    console.log(`Payload do RPC sync_services (${pendingServices.length} itens):`, JSON.stringify(pendingServices, null, 2));

                    const { error } = await supabase.rpc('sync_services', { p_services: pendingServices });

                    if (error) {
                        console.error('❌ Erro no RPC sync_services:', error);
                        console.groupEnd();
                        throw error;
                    }

                    console.log('✅ RPC sync_services executado com sucesso!');
                    console.groupEnd();

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
