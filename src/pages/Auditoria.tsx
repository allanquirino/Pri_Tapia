import { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, Upload, Database, Trash2 } from "lucide-react";
import { db } from "@/services/database";
import { sessionService } from "@/services/session";
import { AuditLog } from "@/services/database";
import { validationService } from "@/services/validationService";
import { logger } from "@/lib/logger";

const Auditoria = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filterAuditLogs = useCallback(() => {
    let filtered = auditLogs;
    if (moduleFilter) {
      filtered = filtered.filter(log => log.module === moduleFilter);
    }
    if (userFilter) {
      filtered = filtered.filter(log => log.user.toLowerCase().includes(userFilter.toLowerCase()));
    }
    return filtered;
  }, [auditLogs, moduleFilter, userFilter]);

  useEffect(() => {
    // Recompute filtered logs when filters change (no-op here since computed on render)
  }, [filterAuditLogs]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await db.getAuditLogs();
      setAuditLogs(data);
      
      // Track activity
      await sessionService.trackActivity();
    } catch (error) {
      logger.error('Error loading audit logs', { error });
    } finally {
      setLoading(false);
    }
  };

  

  const handleExportData = async () => {
    try {
      setExporting(true);
      
      const exportData = await db.exportData();
      
      // Create and download file
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pritapia_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Log the action
      const user = sessionService.getCurrentUser();
      await db.addAuditLog({
        action: 'Data Export',
        user: user?.username || 'System',
        details: 'Complete database backup exported',
        module: 'Data Management'
      });
      
      alert('Dados exportados com sucesso!');
    } catch (error) {
      logger.error('Export error', { error });
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        setImporting(true);
        
        const text = await file.text();
        const success = await db.importData(text);
        
        if (success) {
          await loadAuditLogs(); // Reload data
          
          // Log the action
          const user = sessionService.getCurrentUser();
          await db.addAuditLog({
            action: 'Data Import',
            user: user?.username || 'System',
            details: 'Database backup imported successfully',
            module: 'Data Management'
          });
          
          alert('Dados importados com sucesso! Recarregando página...');
          window.location.reload(); // Reload to show updated data
        } else {
          alert('Erro ao importar dados. Verifique se o arquivo é válido.');
        }
      } catch (error) {
        logger.error('Import error', { error });
        alert('Erro ao importar dados. Tente novamente.');
      } finally {
        setImporting(false);
      }
    };
    
    input.click();
  };

  const handleClearAllData = async () => {
    const confirmMessage = `
⚠️ CUIDADO: Esta ação irá excluir TODOS os dados do sistema!

Esta operação irá apagar:
• Todos os clientes
• Todos os agendamentos  
• Todo o estoque
• Todas as transações financeiras
• Todos os logs de auditoria
• Configurações do sistema

Esta ação NÃO pode ser desfeita!

Tem certeza que deseja continuar?
    `.trim();
    
    if (confirm(confirmMessage)) {
      if (confirm("Confirma novamente? Esta ação é irreversível!")) {
        try {
          await db.clearAllData();
          
          // Log the action
          const user = sessionService.getCurrentUser();
          await db.addAuditLog({
            action: 'Complete Data Clear',
            user: user?.username || 'System',
            details: 'All system data was cleared',
            module: 'Data Management'
          });
          
          alert('Todos os dados foram apagados! Recarregando página...');
          window.location.reload();
        } catch (error) {
          logger.error('Clear data error', { error });
          alert('Erro ao apagar dados. Tente novamente.');
        }
      }
    }
  };

  const getUniqueModules = () => {
    const modules = auditLogs.map(log => log.module);
    return [...new Set(modules)].sort();
  };

  const getUniqueUsers = () => {
    const users = auditLogs.map(log => log.user);
    return [...new Set(users)].sort();
  };

  const getModuleStats = () => {
    const modules = getUniqueModules();
    return modules.map(module => ({
      name: module,
      count: auditLogs.filter(log => log.module === module).length
    }));
  };

  const reports = [
    {
      title: "Relatório Mensal de Agendamentos",
      description: "Total de agendamentos e taxa de ocupação do mês",
      date: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      icon: Calendar,
      color: "text-primary",
      action: () => generateAppointmentsReport()
    },
    {
      title: "Análise de Desempenho",
      description: "Métricas de desempenho e crescimento",
      date: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      icon: TrendingUp,
      color: "text-accent",
      action: () => generatePerformanceReport()
    },
    {
      title: "Relatório de Clientes",
      description: "Novos clientes, retenção e satisfação",
      date: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      icon: Users,
      color: "text-primary-light",
      action: () => generateClientsReport()
    },
    {
      title: "Demonstrativo Financeiro",
      description: "Receitas, despesas e lucro líquido",
      date: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      icon: DollarSign,
      color: "text-primary-dark",
      action: () => generateFinancialReport()
    }
  ];

  const generateAppointmentsReport = () => {
    // This would generate and download an appointments report
    alert('Funcionalidade de relatório em desenvolvimento!');
  };

  const generatePerformanceReport = () => {
    alert('Funcionalidade de relatório em desenvolvimento!');
  };

  const generateClientsReport = () => {
    alert('Funcionalidade de relatório em desenvolvimento!');
  };

  const generateFinancialReport = () => {
    alert('Funcionalidade de relatório em desenvolvimento!');
  };

  const filteredLogs = filterAuditLogs();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando auditoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col cursor-soft">
      <AdminHeader />
      
      <main className="flex-1 bg-gradient-soft py-8 page-transition">
        <div className="container mx-auto px-4 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Auditoria e Relatórios
              </h1>
              <p className="text-muted-foreground">
                Acompanhe atividades e gere relatórios detalhados
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                disabled={exporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? "Exportando..." : "Exportar Dados"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleImportData}
                disabled={importing}
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Importando..." : "Importar Dados"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearAllData}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Tudo
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{auditLogs.length}</p>
                    <p className="text-sm text-muted-foreground">Total de Atividades</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{getUniqueModules().length}</p>
                    <p className="text-sm text-muted-foreground">Módulos Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold">{getUniqueUsers().length}</p>
                    <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {auditLogs.filter(log => {
                        const logDate = new Date(log.timestamp);
                        const today = new Date();
                        return logDate.toDateString() === today.toDateString();
                      }).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Atividades Hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Relatórios Disponíveis</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {reports.map((report, index) => (
                <Card key={index} className="hover:shadow-soft transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-primary/10`}>
                          <report.icon className={`h-6 w-6 ${report.color}`} />
                        </div>
                        <div>
                          <CardTitle className="mb-1">{report.title}</CardTitle>
                          <CardDescription>{report.description}</CardDescription>
                          <p className="text-xs text-muted-foreground mt-2">{report.date}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={report.action}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Module Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas por Módulo</CardTitle>
              <CardDescription>
                Atividades realizadas em cada módulo do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getModuleStats().map((module, index) => (
                  <div key={index} className="text-center p-4 rounded-lg border border-border/40">
                    <div className="text-2xl font-bold text-primary">{module.count}</div>
                    <div className="text-sm text-muted-foreground">{module.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Registro de Atividades</CardTitle>
                  <CardDescription>
                    Histórico de ações realizadas no sistema ({filteredLogs.length} de {auditLogs.length})
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="px-3 py-1 text-sm border border-input rounded-md bg-background"
                  >
                    <option value="">Todos os módulos</option>
                    {getUniqueModules().map(module => (
                      <option key={module} value={module}>{module}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Filtrar por usuário..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="w-32 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredLogs.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredLogs.slice(0, 50).map((log, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-start p-4 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{log.action}</h4>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {log.module}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">{log.user}</p>
                        <p className="text-xs text-muted-foreground">
                          {validationService.formatDateTime(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum log encontrado</p>
                  <p className="text-sm mt-2">
                    {moduleFilter || userFilter 
                      ? 'Tente ajustar os filtros.' 
                      : 'Os logs aparecerão aqui conforme você usa o sistema.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auditoria;
