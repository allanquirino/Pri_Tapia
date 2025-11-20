import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "@/components/layout/AdminHeader";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { sessionService } from "@/services/session";

const Agendamentos = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionService.isAuthenticated()) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />

      <main className="flex-1 bg-gradient-soft py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Agendamentos</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Gerenciamento de Agendamentos</CardTitle>
              </div>
              <CardDescription>
                Sistema de agendamento veterinário - Em desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  O sistema de agendamentos está sendo implementado e estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Agendamentos;
