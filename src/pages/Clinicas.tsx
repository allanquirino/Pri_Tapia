import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/services/database";

const Clinicas = () => {
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { load(); }, [city, specialty]);

  const load = async () => {
    const r = await db.getClinics({ city, specialty });
    setItems(r);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-soft py-8">
        <div className="container mx-auto px-4 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Localizador de Clínicas Veterinárias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Cidade</Label>
                  <Input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="Ex: Guarulhos" />
                </div>
                <div>
                  <Label>Especialidade</Label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="Clinico Geral">Clínico Geral</SelectItem>
                      <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                      <SelectItem value="Dermatologia">Dermatologia</SelectItem>
                      <SelectItem value="Odontologia">Odontologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {items.map((c)=> (
                  <div key={c.id} className="rounded-lg border p-4">
                    <div className="font-bold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.address}</div>
                    {c.phone && <div className="text-xs text-muted-foreground">{c.phone}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Clinicas;
