import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/services/database";
import { sessionService } from "@/services/session";

const Pets = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", species: "", breed: "", birthDate: "", sex: "" });
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (!sessionService.isAuthenticated()) { window.location.href = "/login"; return; }
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await db.getPets();
      setItems(r);
    } finally { setLoading(false); }
  };

  const onSubmit = async () => {
    setStatus("");
    if (!form.name || !form.species || !form.sex) { setStatus("Preencha os campos obrigatórios."); return; }
    try {
      await db.addPet(form);
      setForm({ name: "", species: "", breed: "", birthDate: "", sex: "" });
      await load();
      setStatus("Pet cadastrado.");
    } catch { setStatus("Falha ao cadastrar."); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-soft py-8">
        <div className="container mx-auto px-4 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Pets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Espécie *</Label>
                  <Select value={form.species} onValueChange={(v)=>setForm({ ...form, species: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cachorro">Cachorro</SelectItem>
                      <SelectItem value="gato">Gato</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Raça</Label>
                  <Input value={form.breed} onChange={(e)=>setForm({ ...form, breed: e.target.value })} />
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input type="date" value={form.birthDate} onChange={(e)=>setForm({ ...form, birthDate: e.target.value })} />
                </div>
                <div>
                  <Label>Sexo *</Label>
                  <Select value={form.sex} onValueChange={(v)=>setForm({ ...form, sex: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="femea">Fêmea</SelectItem>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={onSubmit}>Salvar</Button>
                {status && <span className="text-sm text-muted-foreground">{status}</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meus Pets</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground">Carregando...</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((p)=> (
                    <div key={p.id} className="rounded-lg border p-4">
                      <div className="font-bold">{p.name}</div>
                      <div className="text-sm text-muted-foreground">{p.species} {p.breed ? `• ${p.breed}` : ''}</div>
                    </div>
                  ))}
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

export default Pets;
