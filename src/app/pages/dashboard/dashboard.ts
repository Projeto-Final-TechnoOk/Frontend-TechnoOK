import { Component, inject, OnInit, signal } from '@angular/core';

import { CardComponent } from '../../components/card/card';
import { GraficoBarrasComponent } from '../../components/grafico-barras/grafico-barras';
import { SelectComponent, OpcaoSelect } from '../../components/select/select';
import { SetaComponent } from '../../components/seta/seta';

import { DashboardService } from '../../services/dashboard';
import { MedidoresService } from '../../services/medidores';

import { DashboardResumo } from '../../models/dashboard/dashboard-resumo..model';

@Component({
  selector: 'app-dashboard',
  imports: [CardComponent, GraficoBarrasComponent, SelectComponent, SetaComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly medidoresService = inject(MedidoresService);

  ngOnInit(): void {
    this.carregarResumo();
    this.carregarMedidores();
  }

  // =========================
  // Resumo - Cards Superiores
  // =========================

  // Variável que guarda as informações gerais exibidas nos cards de resumo do dashboard
  resumo = signal<DashboardResumo | undefined>(undefined);

  // Busca os dados gerais do sistema utilizados nos cards superiores do dashboard
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

  // ===================================
  // Gráfico de Consumo - Card Inferior
  // ===================================

  // Array utilizado para converter o número do mês em sua abreviação durante a navegação do gráfico
  meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // Guarda as opções de medidores utilizadas no Select do gráfico
  opcoesMedidores = signal<OpcaoSelect[]>([]);

  // Guarda o ID do medidor atualmente selecionado
  medidorSelecionado = signal<string>('');

  // Guarda os rótulos exibidos no eixo horizontal do gráfico
  categoriasGrafico = signal<string[]>([]);

  // Guarda os valores de consumo exibidos no gráfico
  valoresGrafico = signal<number[]>([]);

  // Guarda o nível atualmente apresentado no gráfico permitindo a navegação entre ano, mês e dia
  nivelGrafico = signal<'ano' | 'mes' | 'dia'>('ano');

  // Guarda o ano selecionado durante a navegação do gráfico
  anoSelecionado = signal<number | null>(null);

  // Guarda o mês selecionado durante a navegação do gráfico
  mesSelecionado = signal<number | null>(null);

  // Guarda a cor utilizada no gráfico de acordo com o tipo do medidor selecionado
  corGrafico = signal<string>('#ffffff');

  // Guarda a unidade utilizada no gráfico de acordo com o tipo do medidor selecionado
  unidadeMedida = signal<string>('');

  // ===================
  // Seleção do Medidor
  // ===================

  // Busca os medidores cadastrados e os transforma em opções para o Select do gráfico
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

  // Atualiza o medidor selecionado, define a cor e a unidade do gráfico e retorna a visualização para o nível de ano
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

  // =========================
  // Carregamento do Gráfico
  // =========================

  // Busca os dados de consumo do medidor de acordo com o nível selecionado: ano, mês ou dia
  // Ano -> exibe os anos disponíveis
  // Mês -> exibe os meses do ano selecionado
  // Dia -> exibe os dias do mês selecionado
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

  // ====================
  // Navegação do Gráfico
  // ====================

  // Navega para um nível mais detalhado do gráfico de acordo com a barra selecionada
  // Ano -> Mês
  // Mês -> Dia
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

  // Retorna para o nível anterior do gráfico
  // Dia -> Mês
  // Mês -> Ano
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
