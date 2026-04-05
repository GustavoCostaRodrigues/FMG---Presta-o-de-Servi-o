import Dexie from 'dexie';

export const db = new Dexie('AppGabiDB');

// Definição do esquema para suporte offline
db.version(1).stores({
    clients: '++id, name, document, sync_status',
    machinery: '++id, name, serial_number, client_id, sync_status',
    collaborators: '++id, name, role, sync_status',
    services: 'id, client_id, machine_id, technician_id, service_type_id, title, date, status, sync_status',
    service_types: '++id, name, sync_status'
});

// Estados de sincronização: 
// 'synced' - Dados em dia com o servidor
// 'pending_create' - Novo registro criado offline
// 'pending_update' - Registro existente alterado offline
// 'pending_delete' - Registro deletado offline

export const SYNC_STATUS = {
    SYNCED: 'synced',
    PENDING_CREATE: 'pending_create',
    PENDING_UPDATE: 'pending_update',
    PENDING_DELETE: 'pending_delete'
};

// Inicializa o banco
db.open().then(async () => {
    // Purga manual de dados legacy (IDs antigos no formato OS-)
    await db.services.where('id').startsWith('OS-').delete();

    // Opcional: Se existir algum serviço com id vazio ou inválido, remove também para não travar o sync
    await db.services.filter(s => !s.id || s.id === 'undefined').delete();

    // Auto-correção de campos (migração de 'nome' para 'name')
    await db.clients.toCollection().modify(c => {
        if (!c.name && c.nome) {
            c.name = c.nome;
            delete c.nome;
        }
    });

    console.log('🧹 Database cleanup and healing complete.');
});
