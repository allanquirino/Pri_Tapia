import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, CheckCircle } from "lucide-react";

const petRegistrationSchema = z.object({
  // Dados do Animal
  petName: z.string().min(1, "Nome do animal é obrigatório"),
  species: z.enum(["cachorro", "gato", "outro"], {
    required_error: "Espécie é obrigatória",
  }),
  breed: z.string().optional(),
  age: z.string().optional(),
  sex: z.enum(["macho", "femea", "indefinido"], {
    required_error: "Sexo é obrigatório",
  }),
  color: z.string().optional(),
  birthDate: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  observations: z.string().optional(),

  // Dados do Tutor
  tutorName: z.string().min(1, "Nome do tutor é obrigatório"),
  tutorEmail: z.string().email("Email inválido"),
  tutorPhone: z.string().min(1, "Telefone é obrigatório"),
  tutorAddress: z.string().min(1, "Endereço é obrigatório"),

  // Foto opcional
  photo: z.instanceof(FileList).optional(),
});

type PetRegistrationFormData = z.infer<typeof petRegistrationSchema>;

const PetRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PetRegistrationFormData>({
    resolver: zodResolver(petRegistrationSchema),
  });

  const photoFile = watch("photo");

  const onSubmit = async (data: PetRegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();

      // Dados do animal
      formData.append("petName", data.petName);
      formData.append("species", data.species);
      formData.append("breed", data.breed || "");
      formData.append("age", data.age || "");
      formData.append("sex", data.sex);
      formData.append("color", data.color || "");
      formData.append("birthDate", data.birthDate || "");
      formData.append("medicalHistory", data.medicalHistory || "");
      formData.append("allergies", data.allergies || "");
      formData.append("observations", data.observations || "");

      // Dados do tutor
      formData.append("tutorName", data.tutorName);
      formData.append("tutorEmail", data.tutorEmail);
      formData.append("tutorPhone", data.tutorPhone);
      formData.append("tutorAddress", data.tutorAddress);

      // Foto
      if (data.photo && data.photo.length > 0) {
        formData.append("photo", data.photo[0]);
      }

      // Enviar para API
      const apiBase = (import.meta.env.VITE_API_BASE as string) || '/backend/api/';
      const response = await fetch(`${apiBase}pet-registration.php`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar pet");
      }

      setSubmitSuccess(true);
      reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Cadastro Realizado com Sucesso!
            </h3>
            <p className="text-green-700 mb-4">
              Obrigado por cadastrar seu pet na PriTapia. Você receberá uma confirmação por e-mail em breve.
            </p>
            <Button onClick={() => setSubmitSuccess(false)}>
              Cadastrar Outro Pet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-green-800">
          Cadastro de Animal
        </CardTitle>
        <CardDescription>
          Preencha os dados do seu pet e do tutor responsável
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados do Animal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700 border-b pb-2">
              Dados do Animal
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="petName">
                  Nome do Animal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="petName"
                  {...register("petName")}
                  placeholder="Digite o nome do animal"
                />
                {errors.petName && (
                  <p className="text-red-500 text-sm mt-1">{errors.petName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="species">
                  Espécie <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue("species", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a espécie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cachorro">Cachorro</SelectItem>
                    <SelectItem value="gato">Gato</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.species && (
                  <p className="text-red-500 text-sm mt-1">{errors.species.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="breed">Raça</Label>
                <Input
                  id="breed"
                  {...register("breed")}
                  placeholder="Digite a raça"
                />
              </div>

              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  {...register("age")}
                  placeholder="Ex: 2 anos"
                />
              </div>

              <div>
                <Label htmlFor="sex">
                  Sexo <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue("sex", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="femea">Fêmea</SelectItem>
                    <SelectItem value="indefinido">Indefinido</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sex && (
                  <p className="text-red-500 text-sm mt-1">{errors.sex.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="color">Cor/Pelagem</Label>
                <Input
                  id="color"
                  {...register("color")}
                  placeholder="Ex: Marrom, Branco"
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register("birthDate")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="medicalHistory">Histórico Médico (Vacinas, etc.)</Label>
              <Textarea
                id="medicalHistory"
                {...register("medicalHistory")}
                placeholder="Descreva o histórico médico, vacinas realizadas, etc."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Alergias</Label>
              <Textarea
                id="allergies"
                {...register("allergies")}
                placeholder="Liste as alergias conhecidas"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="observations">Observações Adicionais</Label>
              <Textarea
                id="observations"
                {...register("observations")}
                placeholder="Informações adicionais sobre o animal"
                rows={3}
              />
            </div>
          </div>

          {/* Dados do Tutor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700 border-b pb-2">
              Dados do Tutor Responsável
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tutorName">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tutorName"
                  {...register("tutorName")}
                  placeholder="Digite o nome completo"
                />
                {errors.tutorName && (
                  <p className="text-red-500 text-sm mt-1">{errors.tutorName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tutorEmail">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tutorEmail"
                  type="email"
                  {...register("tutorEmail")}
                  placeholder="Digite o email"
                />
                {errors.tutorEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.tutorEmail.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tutorPhone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tutorPhone"
                  {...register("tutorPhone")}
                  placeholder="Digite o telefone"
                />
                {errors.tutorPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.tutorPhone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="tutorAddress">
                Endereço Completo <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="tutorAddress"
                {...register("tutorAddress")}
                placeholder="Digite o endereço completo"
                rows={3}
              />
              {errors.tutorAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.tutorAddress.message}</p>
              )}
            </div>
          </div>

          {/* Foto Opcional */}
          <div className="space-y-2">
            <Label htmlFor="photo">Foto do Animal (Opcional)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                {...register("photo")}
                className="hidden"
              />
              <Label
                htmlFor="photo"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                Escolher Foto
              </Label>
              {photoFile && photoFile.length > 0 && (
                <span className="text-sm text-gray-600">
                  {photoFile[0].name}
                </span>
              )}
            </div>
          </div>

          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              "Cadastrar Animal"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PetRegistrationForm;