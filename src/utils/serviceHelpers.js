import { db } from '../lib/db';

/**
 * Enriquece uma lista de serviços com nomes de clientes, máquinas, colaboradores e tipos de serviço.
 * @param {Array} services - Lista de serviços brutos do Dexie
 * @returns {Promise<Array>} - Lista de serviços enriquecidos
 */
export const enrichServiceData = async (services) => {
    if (!Array.isArray(services)) return [];

    return Promise.all(services.map(async (s) => {
        const [client, machine, collaborator, serviceType] = await Promise.all([
            s.client_id ? db.clients.get(Number(s.client_id)) : null,
            s.machine_id ? db.machinery.get(Number(s.machine_id)) : null,
            s.technician_id ? db.collaborators.get(Number(s.technician_id)) : null,
            s.service_type_id ? db.service_types.get(Number(s.service_type_id)) : null
        ]);

        return {
            ...s,
            clientName: client?.name || 'Cliente Geral',
            machineName: machine?.name || 'Sem Máquina',
            collaboratorName: collaborator?.name || 'Não atribuído',
            serviceTypeName: serviceType?.name || 'Serviço Geral',
            // Manter compatibilidade com pdfGenerator antigo se necessário
            title: serviceType?.name || s.title || 'Serviço Técnico'
        };
    }));
};
