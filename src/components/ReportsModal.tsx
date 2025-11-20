import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minus, BarChart2, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Pie, PieChart as RPieChart, Cell } from 'recharts';

type Props = {
  open: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  title?: string;
  summary: { totalRevenue: number; totalExpenses: number; netProfit: number; revenueGrowth: number };
  transactions: { type: 'receita' | 'despesa'; category: string; amount: number; date: string }[];
};

const COLORS = ['#ec4899', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];

export default function ReportsModal({ open, onClose, onMinimize, title = 'Relatório de Desempenho', summary, transactions }: Props) {
  const [filterType, setFilterType] = useState<string>('');

  const filtered = useMemo(() => {
    return filterType ? transactions.filter(t => t.type === filterType) : transactions;
  }, [transactions, filterType]);

  const perCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(t => { map[t.category] = (map[t.category] || 0) + Math.abs(t.amount); });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [filtered]);

  const perMonth = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(t => { const m = t.date.slice(0,7); map[m] = (map[m] || 0) + Math.abs(t.amount); });
    return Object.entries(map).map(([month, amount]) => ({ month, amount })).sort((a,b)=>a.month.localeCompare(b.month));
  }, [filtered]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex gap-2">
            {onMinimize && (
              <Button size="icon" variant="ghost" onClick={onMinimize}><Minus className="h-4 w-4" /></Button>
            )}
            <Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="p-4 grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">R$ {summary.totalRevenue.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Despesas Totais</p>
                  <p className="text-2xl font-bold">R$ {summary.totalExpenses.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                  <p className="text-2xl font-bold">R$ {summary.netProfit.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crescimento</p>
                  <p className="text-2xl font-bold">{summary.revenueGrowth.toFixed(1)}%</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <select value={filterType} onChange={(e)=>setFilterType(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background">
                  <option value="">Todos</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </select>
                <Button variant="outline" onClick={()=>exportCSV(filtered)}>Exportar CSV</Button>
                <Button variant="outline" onClick={()=>window.print()}>Imprimir</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><BarChart2 className="h-4 w-4" />Por Mês</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perMonth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><PieChart className="h-4 w-4" />Por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={perCategory} dataKey="amount" nameKey="category" innerRadius={60} outerRadius={100}>
                      {perCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground"><th className="text-left">Categoria</th><th className="text-right">Valor</th></tr>
                  </thead>
                  <tbody>
                    {perCategory.map((r,i)=> (
                      <tr key={i}><td>{r.category}</td><td className="text-right">{validationService.formatCurrency(r.amount)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function exportCSV(rows: { type: string; category: string; amount: number; date: string }[]) {
  const headers = ['type','category','amount','date'];
  const data = rows.map(r => [r.type, r.category, r.amount.toFixed(2), r.date].join(','));
  const csv = headers.join(',') + '\n' + data.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
