import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "@/components/layout/AdminHeader";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Package, DollarSign, TrendingUp, Activity, LogOut, RefreshCw, Link as LinkIcon } from "lucide-react";
import { db } from "@/services/database";
import { sessionService } from "@/services/session";

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    pendingCastrations: 0,
    completedCastrations: 0,
    calledRegistrations: 0,
    todayRegistrations: 0
  });
  type ActivityItem = { type: string; client: string; time: string };
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!sessionService.isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    loadDashboardData();
  }, [navigate]);

  // Load dashboard data from database
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Get statistics from database
      const statistics = await db.getStatistics();
      setStats(statistics);
      
      // Get recent audit logs
      const auditLogs = await db.getAuditLogs();
      const recentLogs = auditLogs.slice(0, 5).map(log => ({
        type: log.action,
        client: log.details,
        time: new Date(log.timestamp).toLocaleString('pt-BR')
      }));
      setRecentActivities(recentLogs);
      
      // Track activity
      await sessionService.trackActivity();
      
    } catch (error) {
      console.error('Error loading dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await sessionService.endSession();
      navigate("/");
    } catch (error) {
      console.error('Logout error', error);
      // Force redirect even if logout fails
      navigate("/");
    }
  };

  // Refresh data
  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Cadastros Hoje",
      value: stats.todayRegistrations.toString(),
      icon: Calendar,
      description: "Cadastros realizados hoje",
      trend: "neutral"
    },
    {
      title: "Total de Cadastros",
      value: stats.totalRegistrations.toString(),
      icon: Users,
      description: "Cadastros totais no sistema",
      trend: "up"
    },
    {
      title: "Castrações Pendentes",
      value: stats.pendingCastrations.toString(),
      icon: Package,
      description: "Aguardando castração",
      trend: stats.pendingCastrations > 0 ? "down" : "up"
    },
    {
      title: "Castrações Concluídas",
      value: stats.completedCastrations.toString(),
      icon: DollarSign,
      description: "Animais castrados",
      trend: "up"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col cursor-soft">
      <AdminHeader />
      
      <main className="flex-1 bg-gradient-soft py-8 page-transition">
        <div className="container mx-auto px-4 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Dashboard PriTapia
              </h1>
              <p className="text-muted-foreground">
                Visão geral dos cadastros e castrações
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-soft transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <p className={`text-xs ${
                    stat.trend === 'up' ? 'text-primary' : 
                    stat.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {stat.description}
                  </p>
      </CardContent>
    </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle>Atividades Recentes</CardTitle>
                </div>
                <CardDescription>
                  Últimas movimentações no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex justify-between items-start border-b border-border/40 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{activity.type}</p>
                          <p className="text-sm text-muted-foreground">{activity.client}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma atividade recente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Desempenho Mensal</CardTitle>
                </div>
                <CardDescription>
                  Receita dos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
                    <p className="text-muted-foreground">Gráfico de desempenho</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Total de cadastros: {stats.totalRegistrations}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso direto às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/agendamentos')}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  Agendamentos
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/clientes')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Clientes
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/estoque')}
                >
                  <Package className="h-6 w-6 mb-2" />
                  Estoque
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/financeiro')}
                >
                  <DollarSign className="h-6 w-6 mb-2" />
                  Financeiro
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/usuarios')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Usuários
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/admin/novidades')}
                >
                  <Activity className="h-6 w-6 mb-2" />
                  Novidades
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
