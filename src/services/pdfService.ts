// PDF Service Implementation
// Handles PDF report generation and email functionality

export interface PDFReportConfig {
  title: string;
  subtitle?: string;
  reportPeriod?: string;
  generatedBy: string;
  generatedAt: Date;
  watermark?: string;
  includeCharts?: boolean;
  footerText?: string;
}

export interface PDFData {
  financialSummary?: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    revenueGrowth: number;
    expenseGrowth: number;
  };
  transactions?: Array<{ type: string; category?: string; amount: number; date: string }>;
  monthlyData?: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  categoryData?: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
}

class PDFService {
  /**
   * Generate HTML report content based on data and configuration
   */
  generateHTMLReport(config: PDFReportConfig, data: PDFData, type: 'financial' | 'appointments' | 'clients'): string {
    const watermark = config.watermark ? `<div class="watermark">${config.watermark}</div>` : '';
    
    const cssStyles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #e91e63; margin-bottom: 10px; }
        .header h2 { color: #666; font-weight: normal; }
        .summary { display: flex; justify-content: space-around; margin: 30px 0; }
        .summary-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .summary-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
        .summary-card .value { font-size: 20px; font-weight: bold; color: #e91e63; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table th { background-color: #f8f9fa; font-weight: bold; }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); 
                     font-size: 48px; color: #f0f0f0; font-weight: bold; z-index: 9999; pointer-events: none; }
        @media print { .watermark { display: none; } }
        .chart-container { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
      </style>
    `;

    let reportContent = '';

    if (type === 'financial') {
      reportContent = this.generateFinancialReportHTML(data, config);
    } else if (type === 'appointments') {
      reportContent = this.generateAppointmentsReportHTML(data, config);
    } else if (type === 'clients') {
      reportContent = this.generateClientsReportHTML(data, config);
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${config.title}</title>
          ${cssStyles}
        </head>
        <body>
          ${watermark}
          <div class="header">
            <h1>${config.title}</h1>
            ${config.subtitle ? `<h2>${config.subtitle}</h2>` : ''}
            ${config.reportPeriod ? `<p><strong>Período:</strong> ${config.reportPeriod}</p>` : ''}
            <p><strong>Gerado por:</strong> ${config.generatedBy}</p>
            <p><strong>Data:</strong> ${validationService.formatDate(config.generatedAt)}</p>
          </div>
          ${reportContent}
          ${config.footerText ? `<div class="footer">${config.footerText}</div>` : ''}
        </body>
      </html>
    `;
  }

  private generateFinancialReportHTML(data: PDFData, config: PDFReportConfig): string {
    const summary = data.financialSummary || {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      revenueGrowth: 0,
      expenseGrowth: 0
    };

    return `
      <div class="summary">
        <div class="summary-card">
          <h3>Receita Total</h3>
          <div class="value">R$ ${summary.totalRevenue.toFixed(2).replace('.', ',')}</div>
        </div>
        <div class="summary-card">
          <h3>Despesas Totais</h3>
          <div class="value">R$ ${summary.totalExpenses.toFixed(2).replace('.', ',')}</div>
        </div>
        <div class="summary-card">
          <h3>Lucro Líquido</h3>
          <div class="value ${summary.netProfit >= 0 ? 'positive' : 'negative'}">
            R$ ${Math.abs(summary.netProfit).toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>

      ${data.transactions && data.transactions.length > 0 ? `
        <h3>Transações Recentes</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.slice(0, 10).map(transaction => `
              <tr>
                <td>${validationService.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td>${transaction.type}</td>
                <td class="${transaction.type === 'receita' ? 'positive' : 'negative'}">
                  ${transaction.type === 'receita' ? '+' : '-'}R$ ${Math.abs(transaction.amount).toFixed(2).replace('.', ',')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>Nenhuma transação encontrada.</p>'}
    `;
  }

  private generateAppointmentsReportHTML(data: PDFData, config: PDFReportConfig): string {
    return `
      <h3>Relatório de Agendamentos</h3>
      <p>Este relatório contém informações sobre agendamentos realizados no período especificado.</p>
      ${data.transactions && data.transactions.length > 0 ? `
        <table class="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Serviço</th>
              <th>Status</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.slice(0, 10).map(transaction => `
              <tr>
                <td>${new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                <td>${transaction.clientName || 'N/A'}</td>
                <td>${transaction.service || 'N/A'}</td>
                <td>${transaction.status || 'N/A'}</td>
                <td>R$ ${(transaction.amount || 0).toFixed(2).replace('.', ',')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>Nenhum agendamento encontrado.</p>'}
    `;
  }

  private generateClientsReportHTML(data: PDFData, config: PDFReportConfig): string {
    return `
      <h3>Relatório de Clientes</h3>
      <p>Este relatório contém informações sobre os clientes cadastrados no sistema.</p>
      ${data.transactions && data.transactions.length > 0 ? `
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Última Visita</th>
              <th>Total de Visitas</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.slice(0, 10).map(transaction => `
              <tr>
                <td>${transaction.name || 'N/A'}</td>
                <td>${transaction.email || 'N/A'}</td>
                <td>${transaction.phone || 'N/A'}</td>
                <td>${transaction.lastVisit ? validationService.formatDate(transaction.lastVisit) : 'N/A'}</td>
                <td>${transaction.totalVisits || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>Nenhum cliente encontrado.</p>'}
    `;
  }

  /**
   * Download HTML report as file
   */
  downloadHTML(htmlContent: string, filename: string): void {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Open HTML report in new window
   */
  openInNewWindow(htmlContent: string, title: string): void {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.title = title;
      newWindow.document.close();
    }
  }

  /**
   * Print HTML content
   */
  printToPDF(): void {
    window.print();
  }

  /**
   * Generate filename for reports
   */
  generateFilename(prefix: string, period: string): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    const cleanPeriod = period.replace(/[^a-zA-Z0-9]/g, '_');
    return `${prefix}_${cleanPeriod}_${timestamp}`;
  }

  /**
   * Send report by email (simulation)
   */
  async sendReport(email: string, htmlContent: string, subject: string): Promise<boolean> {
    try {
      // Simulate email sending - In a real implementation, this would use a backend service
      console.log('Simulating email send:', { email, subject });
      
      // For demo purposes, we'll just log the attempt
      // In production, you would integrate with services like:
      // - SendGrid
      // - AWS SES
      // - EmailJS
      // - Or a custom backend endpoint
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format currency values
   */
  formatCurrency(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format date for reports
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}

// Export singleton instance
export const pdfService = new PDFService();
export default pdfService;
