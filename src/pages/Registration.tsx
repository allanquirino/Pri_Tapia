import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }).max(100),
  address: z.string().trim().min(1, { message: "Endereço é obrigatório" }).max(200),
  email: z.string().trim().email({ message: "Email inválido" }).max(100),
  phone: z.string().trim().min(10, { message: "Telefone inválido" }).max(20),
  animalType: z.enum(["gato", "cachorro"], { message: "Selecione o tipo de animal" }),
  animalGender: z.enum(["macho", "femea"], { message: "Selecione o sexo do animal" }),
  animalAge: z.string().trim().min(1, { message: "Idade é obrigatória" }).max(50),
});

const Registration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    animalType: "",
    animalGender: "",
    animalAge: "",
    isNeutered: false,
    vaccinationsUpdated: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validatedData = registrationSchema.parse({
        name: formData.name,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        animalType: formData.animalType,
        animalGender: formData.animalGender,
        animalAge: formData.animalAge,
      });

      setLoading(true);

      const { error } = await supabase
        .from("neutering_registrations")
        .insert([
          {
            name: validatedData.name,
            address: validatedData.address,
            email: validatedData.email,
            phone: validatedData.phone,
            animal_type: validatedData.animalType,
            animal_gender: validatedData.animalGender,
            animal_age: validatedData.animalAge,
            is_neutered: formData.isNeutered,
            vaccinations_updated: formData.vaccinationsUpdated,
          },
        ]);

      if (error) throw error;

      toast.success("Cadastro realizado com sucesso!", {
        description: "Entraremos em contato em breve para agendar o atendimento.",
      });

      // Reset form
      setFormData({
        name: "",
        address: "",
        email: "",
        phone: "",
        animalType: "",
        animalGender: "",
        animalAge: "",
        isNeutered: false,
        vaccinationsUpdated: false,
      });

      // Redirect to home after 2 seconds
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao enviar cadastro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Cadastro para Castração</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para cadastrar seu animal no programa de castração gratuita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Owner Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Dados do Responsável</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Animal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Dados do Animal</h3>

                <div className="space-y-2">
                  <Label>Tipo de Animal *</Label>
                  <RadioGroup
                    value={formData.animalType}
                    onValueChange={(value) => setFormData({ ...formData, animalType: value })}
                    required
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cachorro" id="cachorro" />
                      <Label htmlFor="cachorro" className="font-normal cursor-pointer">Cachorro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gato" id="gato" />
                      <Label htmlFor="gato" className="font-normal cursor-pointer">Gato</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Sexo do Animal *</Label>
                  <RadioGroup
                    value={formData.animalGender}
                    onValueChange={(value) => setFormData({ ...formData, animalGender: value })}
                    required
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="macho" id="macho" />
                      <Label htmlFor="macho" className="font-normal cursor-pointer">Macho</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="femea" id="femea" />
                      <Label htmlFor="femea" className="font-normal cursor-pointer">Fêmea</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animalAge">Idade do Animal *</Label>
                  <Input
                    id="animalAge"
                    value={formData.animalAge}
                    onChange={(e) => setFormData({ ...formData, animalAge: e.target.value })}
                    placeholder="Ex: 2 anos, 6 meses"
                    required
                    maxLength={50}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNeutered"
                      checked={formData.isNeutered}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, isNeutered: checked as boolean })
                      }
                    />
                    <Label htmlFor="isNeutered" className="font-normal cursor-pointer">
                      Animal já castrado
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vaccinationsUpdated"
                      checked={formData.vaccinationsUpdated}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, vaccinationsUpdated: checked as boolean })
                      }
                    />
                    <Label htmlFor="vaccinationsUpdated" className="font-normal cursor-pointer">
                      Vacinas em dia
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90 shadow-warm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Cadastro"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Registration;