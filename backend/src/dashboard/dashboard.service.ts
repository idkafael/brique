import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brique, BriqueStatus } from '../entities/brique.entity';

export type PeriodType = 'hoje' | 'ontem' | '7d' | '30d' | 'total';

export interface DashboardStats {
  totalAbertas: number;
  totalFechadasNoPeriodo: number;
  valorEmNegociacao: number;
  valorFechadoNoPeriodo: number;
  /** Lucro líquido no período (receita - custo das vendidas). */
  liquidoNoPeriodo: number;
  briquesParadas: number;
  /** Total de briques no período selecionado (7d, 30d, total). */
  briquesTotaisNoPeriodo: number;
  funilPorStatus: { status: string; count: number; valor: number }[];
  evolucao: { label: string; valor: number; quantidade: number }[];
  contatosMaisAtivos: { phone: string; count: number }[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Brique)
    private readonly briqueRepo: Repository<Brique>,
  ) {}

  private getDateRange(period: PeriodType): { from: Date; to: Date } | null {
    const now = new Date();
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);

    if (period === 'hoje') {
      return { from, to };
    }
    if (period === 'ontem') {
      from.setDate(from.getDate() - 1);
      to.setDate(to.getDate() - 1);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    if (period === '7d') {
      from.setDate(from.getDate() - 6);
      return { from, to };
    }
    if (period === '30d') {
      from.setDate(from.getDate() - 29);
      return { from, to };
    }
    return null; // total: sem filtro de data
  }

  async getStats(userId: string, period: PeriodType): Promise<DashboardStats> {
    const range = this.getDateRange(period);
    const briques = await this.briqueRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    const aVenda = briques.filter((b) => b.status === BriqueStatus.A_VENDA);
    const vendidas = briques.filter((b) => b.status === BriqueStatus.VENDIDO);

    const totalAbertas = aVenda.length;
    const valorEmNegociacao = aVenda.reduce((s, b) => s + Number(b.saleValue), 0);

    let totalFechadasNoPeriodo = 0;
    let valorFechadoNoPeriodo = 0;
    let liquidoNoPeriodo = 0;
    let vendidasNoPeriodo: Brique[];
    if (range) {
      vendidasNoPeriodo = vendidas.filter(
        (b) => b.updatedAt >= range.from && b.updatedAt <= range.to,
      );
      totalFechadasNoPeriodo = vendidasNoPeriodo.length;
      valorFechadoNoPeriodo = vendidasNoPeriodo.reduce((s, b) => s + Number(b.saleValue), 0);
      liquidoNoPeriodo = vendidasNoPeriodo.reduce(
        (s, b) => s + (Number(b.saleValue) - Number(b.purchaseValue)),
        0,
      );
    } else {
      vendidasNoPeriodo = vendidas;
      totalFechadasNoPeriodo = vendidas.length;
      valorFechadoNoPeriodo = vendidas.reduce((s, b) => s + Number(b.saleValue), 0);
      liquidoNoPeriodo = vendidas.reduce(
        (s, b) => s + (Number(b.saleValue) - Number(b.purchaseValue)),
        0,
      );
    }

    const diasParado = 7;
    const limiteParado = new Date();
    limiteParado.setDate(limiteParado.getDate() - diasParado);
    const briquesParadas = aVenda.filter((b) => b.updatedAt < limiteParado).length;

    const briquesTotaisNoPeriodo = range
      ? briques.filter((b) => b.updatedAt >= range.from && b.updatedAt <= range.to).length
      : briques.length;

    const funilPorStatus = [
      { status: 'à venda', count: aVenda.length, valor: valorEmNegociacao },
      {
        status: 'vendido',
        count: vendidas.length,
        valor: vendidas.reduce((s, b) => s + Number(b.saleValue), 0),
      },
    ];

    const diasParaEvolucao = period === '7d' ? 7 : period === '30d' ? 30 : 7;
    const evolucao: { label: string; valor: number; quantidade: number }[] = [];
    const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = diasParaEvolucao - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const vendidasNoDia = vendidas.filter(
        (b) => b.updatedAt >= d && b.updatedAt < next,
      );
      const label = diasParaEvolucao <= 7 ? labels[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`;
      evolucao.push({
        label,
        valor: vendidasNoDia.reduce((s, b) => s + Number(b.saleValue), 0),
        quantidade: vendidasNoDia.length,
      });
    }

    const phoneCount = new Map<string, number>();
    briques.forEach((b) => {
      if (b.phone) {
        phoneCount.set(b.phone, (phoneCount.get(b.phone) || 0) + 1);
      }
    });
    const contatosMaisAtivos = Array.from(phoneCount.entries())
      .map(([phone, count]) => ({ phone, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAbertas,
      totalFechadasNoPeriodo,
      valorEmNegociacao,
      valorFechadoNoPeriodo,
      liquidoNoPeriodo,
      briquesParadas,
      briquesTotaisNoPeriodo,
      funilPorStatus,
      evolucao,
      contatosMaisAtivos,
    };
  }
}
