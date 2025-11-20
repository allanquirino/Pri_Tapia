import { useEffect, useState } from 'react';
import AdminHeader from '@/components/layout/AdminHeader';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sessionService } from '@/services/session';

const AdminNovidades = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<{ type: 'success'|'error'|'', message: string }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if (!sessionService.isAuthenticated()) {
      window.location.href = '/login';
    }
  }, []);

  const validate = () => {
    if (!title.trim() || !content.trim()) return 'Preencha título e conteúdo.';
    return '';
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) { setStatus({ type: 'error', message: v }); return; }
    try {
      setLoading(true);
      setStatus({ type: '', message: '' });
      const token = sessionService.getToken();
      const apiBase = (import.meta.env.VITE_API_BASE as string) || '/backend/api/';
      const res = await fetch(`${apiBase}novidades.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || ''}` },
        body: JSON.stringify({ title, content })
      });
      if (!res.ok) {
        const err = await res.json();
        setStatus({ type: 'error', message: err.error || 'Falha ao publicar' });
        return;
      }
      setStatus({ type: 'success', message: 'Novidade publicada com sucesso.' });
      setTitle('');
      setContent('');
    } catch {
      setStatus({ type: 'error', message: 'Erro inesperado' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-1 bg-gradient-soft py-8">
        <div className="container mx-auto px-4 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Publicar Novidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" value={title} onChange={(e)=>setTitle(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea id="content" value={content} onChange={(e)=>setContent(e.target.value)} rows={6} />
                </div>
                <div>
                  <Button onClick={onSubmit} disabled={loading}>
                    {loading ? 'Publicando...' : 'Publicar Novidade'}
                  </Button>
                </div>
                {status.type && (
                  <div className={`p-3 rounded-md border ${status.type==='success' ? 'border-green-300 bg-green-100 text-green-700' : 'border-red-300 bg-red-100 text-red-700'}`}>
                    {status.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminNovidades;
