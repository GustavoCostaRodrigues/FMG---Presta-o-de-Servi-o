import Dexie from 'dexie';

export const db = new Dexie('AppGabiDB');

// Definição do esquema para suporte offline
db.version(1).stores({
    clients: '++id, name, document, sync_status',
    machinery: '++id, name, serial_number, client_id, sync_status',
    collaborators: '++id, name, role, sync_status',
    services: '++id, client_id, machine_id, technician_id, date, status, sync_status',
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

// Dados Iniciais (Seed)
const seedDatabase = async () => {
    const clientsCount = await db.clients.count();
    if (clientsCount === 0) {
        await db.clients.bulkAdd([
            { id: 1, name: 'Metalúrgica Silva', type: 'PJ', email: 'contato@metalurgicasilva.com', phone: '(11) 98888-7777', city: 'São Paulo - SP', sync_status: SYNC_STATUS.SYNCED },
            { id: 2, name: 'João Carlos Oliveira', type: 'PF', email: 'joao.carlos@email.com', phone: '(11) 97777-6666', city: 'São Bernardo - SP', sync_status: SYNC_STATUS.SYNCED },
            { id: 3, name: 'Indústrias Atlas', type: 'PJ', email: 'adm@atlas-ind.br', phone: '(11) 96666-5555', city: 'Guarulhos - SP', sync_status: SYNC_STATUS.SYNCED }
        ]);

        await db.machinery.bulkAdd([
            { id: 101, name: 'Torno CNC Romi V10', model: 'Romi V10', serial: 'CNC-XP992', client_id: 1, status: 'active', sync_status: SYNC_STATUS.SYNCED },
            { id: 102, name: 'Prensa Hidráulica 50T', model: 'PH-50 Mark II', serial: 'SN-002283', client_id: 3, status: 'maintenance', sync_status: SYNC_STATUS.SYNCED },
            { id: 103, name: 'Robô de Solda Kuka', model: 'KR-16 v2', serial: 'KUKA-9921', client_id: null, status: 'active', sync_status: SYNC_STATUS.SYNCED }
        ]);

        await db.collaborators.bulkAdd([
            { id: 1, name: 'Ricardo Oliveira', role: 'Técnico Sênior', status: 'Ativo', email: 'ricardo@neotech.com', phone: '(11) 98877-6655', sync_status: SYNC_STATUS.SYNCED },
            { id: 2, name: 'Juliana Costa', role: 'Engenheira Mecânica', status: 'Ativo', email: 'juliana@neotech.com', phone: '(11) 97766-5544', sync_status: SYNC_STATUS.SYNCED },
            { id: 3, name: 'Marcos Santos', role: 'Técnico de Manutenção', status: 'Férias', email: 'marcos@neotech.com', phone: '(11) 96655-4433', sync_status: SYNC_STATUS.SYNCED },
            { id: 4, name: 'Fernanda Lima', role: 'Eletricista Industrial', status: 'Ativo', email: 'fernanda@neotech.com', phone: '(11) 95544-3322', sync_status: SYNC_STATUS.SYNCED }
        ]);

        await db.services.bulkAdd([
            { id: 'OS-8821', title: 'Manutenção Preditiva - Torno CNC', date: new Date().toISOString(), client_id: 3, valor: 450.00, status: 'paid', sync_status: SYNC_STATUS.SYNCED },
            { id: 'OS-8820', title: 'Reparo de Sensor - Prensa 50T', date: new Date().toISOString(), client_id: 1, valor: 1200.00, status: 'paid', sync_status: SYNC_STATUS.SYNCED },
            { id: 'OS-8819', title: 'Calibração - Robô Kuka v2', date: new Date().toISOString(), client_id: null, valor: 850.00, status: 'paid', sync_status: SYNC_STATUS.SYNCED }
        ]);
    }
};

// Inicializa o seed
db.on('ready', seedDatabase);
db.open();
