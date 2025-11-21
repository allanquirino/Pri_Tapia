import { useEffect, useState } from 'react';

type Item = { id: string; title: string; content: string; imageUrl?: string; linkUrl?: string; author?: string; createdAt: string };

export default function NovidadesList() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  useEffect(()=>{
    (async ()=>{
      try {
        const apiBase = (import.meta.env.VITE_API_BASE as string) || '/backend/api/';
        const res = await fetch(`${apiBase}novidades.php`);
        if (!res.ok) throw new Error('Falha ao carregar novidades');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch(e) {
        setError('Não foi possível carregar as novidades.');
      }
    })();
  },[]);
  if (error) {
    return <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>;
  }
  if (!items.length) return null;
  return (
    <div className="space-y-4">
      {items.map(it => (
        <div key={it.id} className="rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{it.title}</h3>
            <span className="text-xs text-muted-foreground">{new Date(it.createdAt).toLocaleString('pt-BR')}</span>
          </div>
          {it.imageUrl && (
            <img src={it.imageUrl} alt={it.title} className="mt-2 w-full h-48 object-cover rounded-md" />
          )}
          <p className="mt-2 text-sm">{it.content}</p>
          {it.linkUrl && (
            <a href={it.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-blue-600 hover:underline text-sm">
              Saiba mais
            </a>
          )}
          {it.author && <p className="mt-2 text-xs text-muted-foreground">Por {it.author}</p>}
        </div>
      ))}
    </div>
  );
}
