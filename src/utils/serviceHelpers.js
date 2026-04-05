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
            technicianData: collaborator, // Útil para cálculos posteriores
            // Manter compatibilidade com pdfGenerator antigo se necessário
            title: serviceType?.name || s.title || 'Serviço Técnico'
        };
    }));
};

/**
 * Converte strings de duração (ex: "4h 30m", "2,5", "1:15") em horas decimais.
 * @param {string} text - Texto da duração
 * @returns {number} - Horas decimais
 */
export const parseDurationToHours = (text) => {
    if (!text) return 0;

    // Suporte a "4h 30m"
    const hoursMatch = text.match(/(\d+)\s*h/i);
    const minsMatch = text.match(/(\d+)\s*m/i);

    if (hoursMatch || minsMatch) {
        let totalHours = 0;
        if (hoursMatch) totalHours += parseInt(hoursMatch[1]);
        if (minsMatch) totalHours += parseInt(minsMatch[1]) / 60;
        return totalHours;
    }

    // Suporte a "02:30"
    if (text.includes(':')) {
        const [h, m] = text.split(':').map(Number);
        return (h || 0) + (m || 0) / 60;
    }

    // Suporte a "2.5" ou "2,5"
    const num = parseFloat(text.replace(',', '.'));
    return !isNaN(num) ? num : 0;
};

/**
 * Calcula o valor do HH baseado no técnico e na duração.
 * @param {Object} technician - Objeto do colaborador (com valor_base, tipo_recebimento, etc)
 * @param {string|number} duration - Duração (texto ou número de horas)
 * @returns {number} - Valor do HH calculado
 */
export const calculateServiceHH = (technician, duration) => {
    if (!technician) return 0;

    const durationInHours = typeof duration === 'string' ? parseDurationToHours(duration) : Number(duration);
    const { tipo_recebimento, valor_base, carga_horaria_padrao = 220 } = technician;
    const base = Number(valor_base) || 0;
    const load = Number(carga_horaria_padrao) || (tipo_recebimento === 'Diário' ? 8 : 220);

    switch (tipo_recebimento) {
        case 'Mensal':
        case 'Diário':
            // Fórmula: (valor_base / carga_horaria_padrao) * horas_trabalhadas
            return (base / load) * durationInHours;
        case 'Empreitada':
            // Valor fixo acordado, independente da duração
            return base;
        default:
            return 0;
    }
};
