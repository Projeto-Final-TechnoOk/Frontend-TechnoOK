import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnInit, signal, computed } from '@angular/core';

import { ImoveisService } from '../../services/imoveis';
import { CardComponent } from '../../components/card/card';
import { ImovelDetalhes } from '../../models/imoveis/imovel-detalhes.model';
import { TipoMedidor } from '../../enums/medidores/tipo-medidor';
import { MultiBotoesComponent, OpcaoMultiBotoes } from '../../components/multi-botoes/multi-botoes';
import { ConsumoImovel, PeriodoConsumo } from '../../models/imoveis/consumo-imovel';
import { GraficoLinhaComponent } from '../../components/grafico-linha/grafico-linha';
import { GraficoBarrasComponent } from '../../components/grafico-barras/grafico-barras';

@Component({
  selector: 'app-imovel',
  imports: [CardComponent, MultiBotoesComponent, GraficoBarrasComponent, GraficoLinhaComponent],
  templateUrl: './imovel.html',
  styleUrl: './imovel.css',
})
export class ImovelPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly imoveisService = inject(ImoveisService);

  ngOnInit(): void {
    this.carregarImovel();
    this.carregarConsumo();
  }

  // =================================
  // Detalhes - Card Superior Esquerda
  // =================================

  // Tipo contendo os tipos dos medidores
  readonly TipoMedidor = TipoMedidor;

  // Variável que guarda as informações do imóvel + função que busca o imóvel com seus medidores e a última leitura feita por um de seus medidores
  imovel = signal<ImovelDetalhes | null>(null);
  carregarImovel(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.imoveisService.buscarComDetalhes(id).subscribe({
      next: (imovel) => {
        this.imovel.set(imovel);
      },
      error: (erro) => {
        console.error('Erro ao carregar imóvel:', erro);
      },
    });
  }

  // Filtra os medidores do imóvel por tipo e retorna a quantidade de cada um
  quantidadeMedidoresPorTipo(tipo: TipoMedidor): number {
    const imovel = this.imovel();

    if (!imovel) {
      return 0;
    }

    return imovel.medidores.filter((medidor) => medidor.tipo === tipo).length;
  }

  // Formata o DateTime buscado para ser mostrado na tela -> Formato: "dd/mmm/yyyy - hh:mm"
  formatarUltimaLeitura(dataHora: Date): string {
    const data = new Date(dataHora);

    const hora = data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const dia = data.toLocaleDateString('pt-BR');

    return `${dia} - ${hora}`;
  }

  // Verifica o tipo do medidor da última leitura e atribui a unidade corretamente.
  obterUnidadeMedidor(medidorId: string): string {
    const imovel = this.imovel();

    if (!imovel) {
      return '';
    }

    const medidor = imovel.medidores.find((medidor) => medidor.id === medidorId);

    if (!medidor) {
      return '';
    }

    switch (medidor.tipo) {
      case TipoMedidor.ENERGIA:
        return 'kWh';

      case TipoMedidor.AGUA:
        return 'm³';

      case TipoMedidor.GAS:
        return 'm³';

      default:
        return '';
    }
  }

  // Deixa o valor da leitura com 3 casas decimais.
  formatarValor(valor: number): string {
    return Number(valor).toFixed(3);
  }

  // =================================
  // Medidores - Card Superior Direita
  // =================================

  // Redireciona o usuário para o medidor clicado
  abrirMedidor(id: string): void {
    this.router.navigate(['/medidores', id]);
  }

  // ========================
  // Gráficos - Card Inferior
  // ========================

  // Define as opções do MultiBotões de Tipo assim como cor e texto de acordo com o tipo selecionado
  opcoesTiposConsumo: OpcaoMultiBotoes[] = [
    {
      label: 'Energia',
      value: TipoMedidor.ENERGIA,
      corAtiva: 'var(--cor-amarelo-energia)',
      corTextoAtivo: 'var(--cor-texto-primario)',
    },
    {
      label: 'Água',
      value: TipoMedidor.AGUA,
      corAtiva: 'var(--cor-azul-agua)',
      corTextoAtivo: 'var(--cor-branco)',
    },
    {
      label: 'Gás',
      value: TipoMedidor.GAS,
      corAtiva: 'var(--cor-verde-gas)',
      corTextoAtivo: 'var(--cor-branco)',
    },
  ];

  // Variável que guarda o tipo selecionado + função que altera esse valor
  tipoConsumoSelecionado = signal<TipoMedidor>(TipoMedidor.AGUA);
  alterarTipoConsumo(tipo: string): void {
    this.tipoConsumoSelecionado.set(tipo as TipoMedidor);

    this.carregarConsumo();
  }

  // Define as opções do MultiBotões de Período assim como cor e texto das opções.
  opcoesPeriodosConsumo: OpcaoMultiBotoes[] = [
    {
      label: '24 horas',
      value: '24h',
      corAtiva: 'var(--cor-secundaria)',
      corTextoAtivo: 'var(--cor-texto-primario)',
    },
    {
      label: '7 dias',
      value: '7d',
      corAtiva: 'var(--cor-secundaria)',
      corTextoAtivo: 'var(--cor-texto-primario)',
    },
    {
      label: '30 dias',
      value: '30d',
      corAtiva: 'var(--cor-secundaria)',
      corTextoAtivo: 'var(--cor-texto-primario)',
    },
  ];

  // Variável que guarda o período selecionado + função que altera esse valor
  periodoConsumoSelecionado = signal<'24h' | '7d' | '30d'>('7d');
  alterarPeriodoConsumo(periodo: string): void {
    this.periodoConsumoSelecionado.set(periodo as PeriodoConsumo);

    this.carregarConsumo();
  }

  // Variável que vai guardar os dados de consumo do imóvel + função que vai atualizar a variável
  consumo = signal<ConsumoImovel | null>(null);
  carregarConsumo(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.imoveisService
      .buscarConsumo(id, this.tipoConsumoSelecionado(), this.periodoConsumoSelecionado())
      .subscribe({
        next: (consumo) => {
          this.consumo.set(consumo);
          console.log('Consumo do imóvel:', consumo);
        },

        error: (erro) => {
          console.error('Erro ao carregar consumo do imóvel:', erro);
        },
      });
  }
  // Entrega os dados de forma genérica para ambos os gráficos consumirem.
  // Dados são entregues em um array de período, que guarda todos os dias ou horas do período e um de medidores
  // O array de medidores guarda os medidores juntamente com um array dos seus consumos durante o período selecionado

  // Variável que armazena e que prepara os dados genéricos para consumo do gráfico da esquerda
  // Soma os consumos dos diferentes medidores por unidade do período (hora ou dia)
  dadosGraficoLinha = computed(() => {
    const consumo = this.consumo();

    if (!consumo) {
      return [];
    }

    let acumulado = 0;

    const pontos = consumo.intervalos.map((intervalo, indice) => {
      const consumoIntervalo = consumo.medidores.reduce(
        (total, medidor) => total + (medidor.consumos[indice] ?? 0),
        0,
      );

      acumulado += consumoIntervalo;

      return {
        rotulo: intervalo.rotulo,
        consumo: Number(acumulado.toFixed(3)),
      };
    });

    return [
      {
        rotulo: 'Início',
        consumo: 0,
      },
      ...pontos,
    ];
  });

  // Variável que armazena e que prepara os dados genéricos para consumo do gráfico da direita
  // Soma os diferentes consumos do período selecionado por medidores (soma todo o consumo do medidor)
  dadosGraficoBarras = computed(() => {
    const consumo = this.consumo();

    if (!consumo) {
      return [];
    }

    return consumo.medidores
      .map((medidor) => {
        const total = medidor.consumos.reduce((soma, valor) => soma + valor, 0);

        return {
          identificador: medidor.identificador,
          consumo: Number(total.toFixed(3)),
        };
      })
      .sort((a, b) => b.consumo - a.consumo);
  });

  // Separa os rótulos e os valores preparados para o gráfico de linha.
  // As categorias representam os períodos (horas ou dias) e os valores representam o consumo acumulado.
  categoriasGraficoLinha = computed(() => this.dadosGraficoLinha().map((item) => item.rotulo));

  valoresGraficoLinha = computed(() => this.dadosGraficoLinha().map((item) => item.consumo));

  // Separa os identificadores e os valores preparados para o gráfico de barras.
  // As categorias representam os medidores e os valores representam o consumo total de cada medidor no período.
  categoriasGraficoBarras = computed(() =>
    this.dadosGraficoBarras().map((item) => item.identificador),
  );

  valoresGraficoBarras = computed(() => this.dadosGraficoBarras().map((item) => item.consumo));

  // Variavel que guarda a cor que deve ser mostrada com o gráfico (compara e muda de acordo com o tipo do medidor)
  corGrafico = computed(() => {
    switch (this.tipoConsumoSelecionado()) {
      case TipoMedidor.ENERGIA:
        return '#e7a900';

      case TipoMedidor.AGUA:
        return '#156de7';

      case TipoMedidor.GAS:
        return '#7ca923';

      default:
        return '#000000';
    }
  });

  // Variavel que guarda a unidade que deve ser mostrada com o gráfico (compara e muda de acordo com o tipo do medidor)
  unidadeGrafico = computed(() => this.consumo()?.unidade ?? '');
}
