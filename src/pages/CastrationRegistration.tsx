import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CastrationRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    animal_type: "",
    sex: "",
    age: "",
    castration_status: "",
    vaccines_up_to_date: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/backend/api/castration_registrations.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          address: "",
          email: "",
          phone: "",
          animal_type: "",
          sex: "",
          age: "",
          castration_status: "",
          vaccines_up_to_date: false
        });
      } else {
        setError(result.error || "Erro ao enviar cadastro");
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError("Erro interno. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Cadastro Enviado!</h2>
            <p className="text-muted-foreground mb-6">
              Obrigado por se cadastrar. Entraremos em contato em breve para agendar a castração.
            </p>
            <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Cadastro para Castração
          </h1>
          <p className="text-green-700">
            Ajude-nos a cuidar dos animais. Cadastre seu pet para castração gratuita.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Informações do Tutor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  placeholder="Rua, número, bairro, cidade - SP"
                  rows={3}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Informações do Animal</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Animal *</Label>
                    <Select value={formData.animal_type} onValueChange={(value) => handleInputChange("animal_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gato">Gato</SelectItem>
                        <SelectItem value="cachorro">Cachorro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sexo *</Label>
                    <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="macho">Macho</SelectItem>
                        <SelectItem value="femea">Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade do Animal</Label>
                    <Input
                      id="age"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="Ex: 2 anos, 6 meses"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status de Castração *</Label>
                    <Select value={formData.castration_status} onValueChange={(value) => handleInputChange("castration_status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="castrado">Já castrado</SelectItem>
                        <SelectItem value="nao_castrado">Não castrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="vaccines"
                    checked={formData.vaccines_up_to_date}
                    onCheckedChange={(checked) => handleInputChange("vaccines_up_to_date", checked)}
                  />
                  <Label htmlFor="vaccines" className="text-sm">
                    Vacinas em dia
                  </Label>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Cadastro"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => navigate("/")}>
            ← Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CastrationRegistration;