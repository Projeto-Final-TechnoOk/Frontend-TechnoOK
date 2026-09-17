import { Component, inject, OnInit, signal } from '@angular/core';
import { CardComponent } from '../../components/card/card';
import { DashboardService } from '../../services/dashboard';
import { DashboardResumo } from '../../models/dashboard/dashboard-resumo..model';
import { GraficoBarrasComponent } from '../../components/grafico-barras/grafico-barras';
import { SelectComponent, OpcaoSelect } from '../../components/select/select';
import { MedidoresService } from '../../services/medidores';
import { SetaComponent } from '../../components/seta/seta';

@Component({
  imports: [CardComponent, GraficoBarrasComponent, SelectComponent, SetaComponent],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly medidoresService = inject(MedidoresService);

  meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  ngOnInit(): void {
    this.carregarResumo();
    this.carregarMedidores();
  }

  // Resumo
  resumo = signal<DashboardResumo | undefined>(undefined);

  carregarResumo(): void {
    this.dashboardService.obterResumo().subscribe({
      next: (dados) => {
        this.resumo.set(dados);
      },
      error: (erro) => {
        console.error('Erro ao carregar resumo do dashboard:', erro);
      },
    });
  }

  // Gráfico Consumo
  opcoesMedidores = signal<OpcaoSelect[]>([]);
  medidorSelecionado = signal<string>('');

  categoriasGrafico = signal<string[]>([]);
  valoresGrafico = signal<number[]>([]);
  nivelGrafico = signal<'ano' | 'mes' | 'dia'>('ano');

  anoSelecionado = signal<number | null>(null);
  mesSelecionado = signal<number | null>(null);

  corGrafico = signal<string>('#ffffff');
  unidadeMedida = signal<string>('');

  carregarMedidores(): void {
    this.medidoresService.listar().subscribe({
      next: (medidores) => {
        const opcoes = medidores.map((medidor) => ({
          label: medidor.identificador,
          value: medidor.id,
          tipo: medidor.tipo,
        }));

        this.opcoesMedidores.set(opcoes);
      },
      error: (erro) => {
        console.error('Erro ao carregar medidores:', erro);
      },
    });
  }

  selecionarMedidor(id: string): void {
    this.medidorSelecionado.set(id);

    const medidor = this.opcoesMedidores().find((opcao) => opcao.value === id);

    if (medidor) {
      if (medidor.tipo === 'ENERGIA') {
        this.corGrafico.set('#e7a900');
        this.unidadeMedida.set('kWh');
      }

      if (medidor.tipo === 'AGUA') {
        this.corGrafico.set('#004ebc');
        this.unidadeMedida.set('m³');
      }

      if (medidor.tipo === 'GAS') {
        this.corGrafico.set('#7ca923');
        this.unidadeMedida.set('m³');
      }
    }

    this.anoSelecionado.set(null);
    this.mesSelecionado.set(null);

    this.carregarNivel('ano');
  }

  carregarNivel(nivel: 'ano' | 'mes' | 'dia', ano?: number, mes?: number): void {
    this.medidoresService.obterConsumo(this.medidorSelecionado(), nivel, ano, mes).subscribe({
      next: (consumos) => {
        this.categoriasGrafico.set(
          nivel === 'mes'
            ? consumos.map((consumo) => this.meses[Number(consumo.name)])
            : consumos.map((consumo) => consumo.name),
        );

        this.valoresGrafico.set(consumos.map((consumo) => consumo.value));

        this.nivelGrafico.set(nivel);
      },
      error: (erro) => {
        console.error('Erro ao carregar consumo:', erro);
      },
    });
  }

  aoClicarBarra(valor: string): void {
    const nivel = this.nivelGrafico();

    if (nivel === 'ano') {
      const ano = Number(valor);
      this.anoSelecionado.set(ano);
      this.mesSelecionado.set(null);

      this.carregarNivel('mes', ano);
      return;
    }

    if (nivel === 'mes') {
      const mes = this.meses.indexOf(valor);
      const ano = this.anoSelecionado();

      if (!ano || mes === -1) {
        return;
      }
      this.mesSelecionado.set(mes);

      this.carregarNivel('dia', ano, mes);
    }
  }

  voltarNivel(): void {
    const nivel = this.nivelGrafico();

    if (nivel === 'dia') {
      const ano = this.anoSelecionado();

      if (!ano) {
        return;
      }
      this.mesSelecionado.set(null);

      this.carregarNivel('mes', ano);
      return;
    }

    if (nivel === 'mes') {
      this.anoSelecionado.set(null);
      this.mesSelecionado.set(null);

      this.carregarNivel('ano');
    }
  }
}
