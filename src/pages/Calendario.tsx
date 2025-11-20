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

const Calendario = () => {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    if (!sessionService.isAuthenticated()) { window.location.href = "/login"; return; }
    load();
  }, []);

  const load = async () => {
    const r = await db.calendarEvents();
    setItems(r);
  };

  const add = async () => {
    if (!title || !date || !type) return;
    await db.calendarAddEvent({ title, eventDate: date, eventTime: time, type });
    setTitle(""); setDate(""); setTime(""); setType("");
    await load();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-soft py-8">
        <div className="container mx-auto px-4 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Cuidados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label>Título</Label>
                  <Input value={title} onChange={(e)=>setTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Hora</Label>
                  <Input type="time" value={time} onChange={(e)=>setTime(e.target.value)} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacina">Vacina</SelectItem>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="banho">Banho</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={add}>Adicionar</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((e)=> (
                  <div key={e.id} className="rounded-lg border p-4">
                    <div className="font-bold">{e.title}</div>
                    <div className="text-sm text-muted-foreground">{e.eventDate} {e.eventTime || ''} • {e.type}</div>
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

export default Calendario;
