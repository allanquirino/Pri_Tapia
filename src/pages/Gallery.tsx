import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Gallery = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Galeria de Atendimentos</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Momentos especiais dos nossos atendimentos e ações realizadas
          </p>
        </div>

        <Card className="shadow-soft mb-8">
          <CardContent className="pt-6 text-center">
            <Instagram className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              Acompanhe nossas ações no Instagram
            </h2>
            <p className="text-muted-foreground mb-6">
              Todas as fotos dos nossos atendimentos, mutirões e momentos especiais 
              estão disponíveis no nosso perfil do Instagram.
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-gradient-warm shadow-warm"
            >
              <a 
                href="https://www.instagram.com/pritapia?igsh=YmZ0bXppMW15dGVn&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-5 w-5" />
                Ver Galeria no Instagram
              </a>
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-soft transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                <Instagram className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Mutirões Veterinários</h3>
              <p className="text-muted-foreground">
                Fotos e vídeos dos nossos mutirões de atendimento veterinário gratuito para a comunidade.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-warm transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-warm rounded-full flex items-center justify-center mb-4">
                <Instagram className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Castrações Realizadas</h3>
              <p className="text-muted-foreground">
                Registros das castrações e cuidados pós-operatório dos animais atendidos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Gallery;