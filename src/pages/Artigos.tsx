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

const Artigos = () => {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [catNew, setCatNew] = useState("");

  useEffect(() => { load(); }, [q, category]);

  const load = async () => {
    const r = await db.getArticles({ q, category });
    setItems(r);
  };

  const onCreate = async () => {
    if (!sessionService.isAuthenticated()) { window.location.href = "/login"; return; }
    if (!title.trim() || !content.trim() || !catNew) return;
    await db.addArticle({ title, content, category: catNew });
    setTitle(""); setContent(""); setCatNew("");
    await load();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-soft py-8">
        <div className="container mx-auto px-4 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Artigos de Cuidados com Pets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Busca</Label>
                  <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Digite palavras-chave" />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="saude">Saúde animal</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                      <SelectItem value="bem_estar">Bem-estar e comportamento</SelectItem>
                      <SelectItem value="racas">Raças</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {items.map((a)=> (
                  <div key={a.id} className="rounded-lg border p-4">
                    <div className="font-bold">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.category}</div>
                    <p className="mt-2 text-sm">{a.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Novo Artigo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Título</Label>
                  <Input value={title} onChange={(e)=>setTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={catNew} onValueChange={setCatNew}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saude">Saúde animal</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                      <SelectItem value="bem_estar">Bem-estar e comportamento</SelectItem>
                      <SelectItem value="racas">Raças</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Label>Conteúdo</Label>
                  <Input value={content} onChange={(e)=>setContent(e.target.value)} />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={onCreate}>Publicar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Artigos;
