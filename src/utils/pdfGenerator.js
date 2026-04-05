import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importando a logo para uso no PDF
import logoFazenda from '../assets/logo-fazenda.jpg';
import logoFazendaMenor from '../assets/logomenor.png';

export const generateServiceReport = ({ title, subtitle, type, data, filename }) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- Cores do Design ---
    const colors = {
        emeraldPrimary: [0, 135, 94], // #00875E
        emeraldLight: [240, 249, 246],
        emeraldFaint: [225, 238, 233],
        grayDark: [28, 28, 30],
        grayMedium: [142, 142, 147],
        grayLight: [229, 229, 234],
        white: [255, 255, 255],
        black: [0, 0, 0],
        pending: [255, 149, 0],
        inProgress: [0, 122, 255],
        paid: [52, 199, 89]
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return '---';
        const d = date instanceof Date ? date : new Date(date);
        return isNaN(d.getTime()) ? '---' : format(d, 'dd/MM/yyyy');
    };

    try {
        // --- 1. FOLHA DE ROSTO ---
        // Fundo decorativo (barra lateral sutil)
        doc.setFillColor(...colors.emeraldLight);
        doc.rect(0, 0, 10, pageHeight, 'F');

        // Logo Centralizada
        const logoWidth = 80;
        const logoHeight = (284 / 896) * logoWidth;
        try {
            doc.addImage(logoFazenda, 'JPEG', (pageWidth - logoWidth) / 2, 60, logoWidth, logoHeight);
        } catch (e) {
            console.warn("Logo could not be added to cover page:", e);
        }

        // Título Principal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(...colors.grayDark);
        doc.text('Relatório de Serviços Prestados', pageWidth / 2, 120, { align: 'center' });

        // Informações de Contexto (Filtro)
        doc.setDrawColor(...colors.emeraldPrimary);
        doc.setLineWidth(1);
        doc.line(pageWidth / 4, 135, (pageWidth / 4) * 3, 135);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${type}: ${title}`, pageWidth / 2, 150, { align: 'center' });

        if (subtitle) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(...colors.grayMedium);
            doc.text(subtitle, pageWidth / 2, 158, { align: 'center' });
        }

        // Período
        const dates = data.map(d => new Date(d.date)).filter(d => !isNaN(d.getTime()));
        const startDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
        const endDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;

        doc.setFontSize(12);
        doc.setTextColor(...colors.grayDark);
        doc.setFont('helvetica', 'bold');
        const periodText = startDate && endDate
            ? `Período: ${formatDate(startDate)} a ${formatDate(endDate)}`
            : 'Período: Geral';
        doc.text(periodText, pageWidth / 2, 180, { align: 'center' });

        // Resumo Rápido
        const totalAmount = data.reduce((sum, s) => sum + (s.valor || 0), 0);
        doc.setFontSize(14);
        doc.text(`Total de Atividades: ${data.length}`, pageWidth / 2, 200, { align: 'center' });
        doc.setTextColor(...colors.emeraldPrimary);
        doc.setFontSize(18);
        doc.text(`Valor Total: ${formatCurrency(totalAmount)}`, pageWidth / 2, 212, { align: 'center' });

        // Rodapé da Capa
        doc.setFontSize(10);
        doc.setTextColor(...colors.grayMedium);
        doc.setFont('helvetica', 'normal');
        doc.text('Fazenda Morro Grande | Gestão Operacional', pageWidth / 2, pageHeight - 20, { align: 'center' });


        // --- 2. LISTAGEM DE SERVIÇOS (CARDS) ---
        doc.addPage();
        let currentY = 45; // Aumentado para evitar sobreposição com a logo
        const cardMargin = 8;
        const cardWidth = pageWidth - 40;
        const cardHeight = 45;

        // Cabeçalho Interno (Logo e Título)
        const drawPageHeader = () => {
            const smLogoW = 25;
            // Passar 0 para altura faz o jsPDF manter a proporção original da imagem
            try {
                doc.addImage(logoFazendaMenor, 'PNG', 20, 10, smLogoW, 0);
            } catch (e) {
                console.warn("Logo could not be added to page header:", e);
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...colors.black);
            doc.text('DETALHAMENTO DE ATIVIDADES', pageWidth - 20, 22, { align: 'right' });
            doc.setDrawColor(...colors.grayLight);
            doc.setLineWidth(0.2);
            doc.line(20, 38, pageWidth - 20, 38); // Linha abaixo da logo
        };

        const drawFooter = (pageNumber, totalPages) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...colors.grayMedium);
            doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text('F.M.G - Agronegócios', 20, pageHeight - 10);
        };

        drawPageHeader();

        data.forEach((service, index) => {
            if (currentY + cardHeight > pageHeight - 20) {
                doc.addPage();
                drawPageHeader();
                currentY = 45; // Reseta para nova página
            }

            // Desenhar Card
            const x = 20;
            const y = currentY;
            const radius = 6;

            // Shadow
            doc.setFillColor(0, 0, 0, 0.02);
            doc.roundedRect(x + 1, y + 1, cardWidth, cardHeight, radius, radius, 'F');

            // Border and Background
            doc.setFillColor(...colors.white);
            doc.setDrawColor(...colors.grayLight);
            doc.setLineWidth(0.3);
            doc.roundedRect(x, y, cardWidth, cardHeight, radius, radius, 'FD');

            // Status Line
            const statusColor = service.status === 'paid' ? colors.paid :
                service.status === 'in_progress' ? colors.inProgress : colors.pending;
            doc.setFillColor(...statusColor);
            // Fix: Standard roundedRect arguments (x, y, w, h, rx, ry, style)
            doc.roundedRect(x, y, 4, cardHeight, radius, radius, 'F');
            // Overlay a rectangle to make right side of status bar square if needed, 
            // but for simplicity we'll just round all and it looks fine.
            doc.rect(x + 2, y, 2, cardHeight, 'F');

            // ID e Data
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colors.grayMedium);
            const displayId = String(service.id).length > 12 ? `OS-${String(service.id).slice(0, 8)}` : service.id;
            doc.text(String(displayId), x + 10, y + 10);
            doc.text(formatDate(service.date), pageWidth - 30, y + 10, { align: 'right' });

            // Título e Categoria
            doc.setFontSize(11);
            doc.setTextColor(...colors.grayDark);
            doc.setFont('helvetica', 'bold');
            const descText = (service.serviceTypeName || service.title || 'Atividade Especial').toUpperCase();
            doc.text(descText, x + 10, y + 18);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.grayMedium);
            doc.text(`Máquina: ${service.machineName || '---'}`, x + 10, y + 24);
            doc.text(`Cliente: ${service.clientName || '---'}`, x + 10, y + 29);

            // Técnicos
            doc.setFont('helvetica', 'italic');
            doc.text(`Equipe: ${service.collaboratorName || '---'}`, x + 10, y + 36);

            // Badge de Status
            const statusName = service.status === 'paid' ? 'CONCLUÍDA' :
                service.status === 'in_progress' ? 'EXECUTANDO' : 'EM ABERTO';

            const badgeWidth = doc.getTextWidth(statusName) + 6;
            doc.setFillColor(...statusColor);
            doc.roundedRect(pageWidth - 25 - badgeWidth, y + 14, badgeWidth, 6, 2, 2, 'F');
            doc.setTextColor(...colors.white);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text(statusName, pageWidth - 25 - (badgeWidth / 2), y + 18, { align: 'center' });

            // Valor e Duração
            doc.setFontSize(12);
            doc.setTextColor(...colors.emeraldPrimary);
            doc.text(formatCurrency(service.valor), pageWidth - 30, y + 32, { align: 'right' });

            doc.setFontSize(9);
            doc.setTextColor(...colors.grayMedium);
            doc.text(`${service.duration || 0}h trabalhadas`, pageWidth - 30, y + 38, { align: 'right' });

            currentY += cardHeight + cardMargin;
        });

        // Aplicar rodapés
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            drawFooter(i, totalPages);
        }

        doc.save(filename || `relatorio-fazenda-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
        console.error("Critical error generating PDF:", error);
        alert("Erro ao gerar o PDF. Verifique o console para mais detalhes.");
    }
};