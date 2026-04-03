import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Gera um relatório em PDF para prestações de serviço.
 * @param {Object} options - Opções do relatório
 * @param {string} options.title - Título principal (ex: Cliente, Máquina ou Colaborador)
 * @param {string} options.subtitle - Subtítulo (ex: nome do cliente ou modelo da máquina)
 * @param {string} options.type - Tipo de relatório (Cliente, Maquinário, Colaborador)
 * @param {Array} options.data - Lista de serviços
 * @param {string} options.filename - Nome do arquivo resultante
 */
export const generateServiceReport = ({ title, subtitle, type, data, filename }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Estilos de Cor (Esmeralda)
    const emeraldColor = [0, 135, 94]; // #00875E

    // Cabeçalho
    doc.setFillColor(...emeraldColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Serviços', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    doc.text(`Gerado em: ${today}`, pageWidth - 20, 25, { align: 'right' });

    // Informações do Filtro/Entidade
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${type}: ${title}`, 20, 55);

    if (subtitle) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle, 20, 62);
    }

    // Linha divisória
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 70, pageWidth - 20, 70);

    // Tabela de Serviços
    const tableColumn = ["ID", "Data", "Descrição/Máquina", "Cliente/Destino", "Status", "Valor"];
    const tableRows = data.map(service => {
        const serviceDate = service.date ? (
            service.date instanceof Date ? service.date : new Date(service.date)
        ) : new Date();

        const formattedDate = !isNaN(serviceDate.getTime())
            ? format(serviceDate, 'dd/MM/yyyy')
            : '---';

        const description = service.machineName || service.machine_name || service.title || service.duration || '---';
        const client = service.clientName || service.client_name || service.client || subtitle || '---';

        // Melhorar detecção de status
        let statusText = 'Pendente';
        if (service.status === 'paid' || service.status === 'Concluído' || service.status === 'active') {
            statusText = 'Pago/Ativo';
        }

        const amount = service.total_amount || service.totalAmount || service.valor || service.amount || 0;
        const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

        return [
            String(service.id).startsWith('OS-') ? service.id : `OS-${service.id}`,
            formattedDate,
            description,
            client,
            statusText,
            formattedAmount
        ];
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 80,
        theme: 'striped',
        headStyles: {
            fillColor: emeraldColor,
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 248, 247] },
        margin: { top: 80, left: 20, right: 20 }
    });

    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        doc.text('AppGabi - Gestão de Serviços Técnicos', 20, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(filename || `relatorio-servicos-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
