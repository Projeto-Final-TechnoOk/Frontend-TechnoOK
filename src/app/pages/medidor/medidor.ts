import { ActivatedRoute, Router } from '@angular/router';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { forkJoin } from 'rxjs';

import { MedidoresService } from '../../services/medidores';
import { ImoveisService } from '../../services/imoveis';

import { CardComponent } from '../../components/card/card';
import { MultiBotoesComponent, OpcaoMultiBotoes } from '../../components/multi-botoes/multi-botoes';
import { GraficoLinhaComponent } from '../../components/grafico-linha/grafico-linha';

import { MedidorDetalhes } from '../../models/medidores/medidor-detalhes.model';
import { ComparacaoConsumoMedidor } from '../../models/medidores/comparacao-consumo-medidor.model';
import { TipoMedidor } from '../../enums/medidores/tipo-medidor';
import { ConsumoImovel, PeriodoConsumo } from '../../models/imoveis/consumo-imovel';

@Component({
  selector: 'app-medidor',
  imports: [CardComponent, MultiBotoesComponent, GraficoLinhaComponent],
  templateUrl: './medidor.html',
  styleUrl: './medidor.css',
})
export class MedidorPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly medidoresService = inject(MedidoresService);
  private readonly imoveisService = inject(ImoveisService);

  // Guarda o número da requisição de consumo mais recente para evitar que respostas antigas sobrescrevam os dados após uma troca rápida de período
  private requisicaoConsumoAtual = 0;

  ngOnInit(): void {
    this.carregarMedidor();
  }

  // =================================
  // Detalhes - Card Superior Esquerda
  // =================================

  // Variável que guarda as informações do medidor, seu imóvel, sua última leitura e suas 50 últimas leituras
  medidor = signal<MedidorDetalhes | null>(null);

  // Busca os detalhes do medidor e, após carregá-los, inicia a busca dos dados de consumo utilizados no card inferior
  carregarMedidor(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.medidoresService.buscarComDetalhes(id).subscribe({
      next: (medidor) => {
        this.medidor.set(medidor);
        this.carregarDadosConsumo();
      },

      error: (erro) => {
        console.error('Erro ao carregar medidor:', erro);
      },
    });
  }

  // Redireciona o usuário para o imóvel associado ao medidor
  abrirImovel(id: string): void {
    this.router.navigate(['/imoveis', id]);
  }

  // Retorna a unidade correspondente ao tipo do medidor
  obterUnidade(tipo: TipoMedidor): string {
    if (tipo === TipoMedidor.AGUA || tipo === TipoMedidor.GAS) {
      return 'm³';
    }
    if (tipo === TipoMedidor.ENERGIA) {
      return 'kWh';
    } else {
      return '';
    }
  }

  // Deixa o valor da leitura ou consumo com 3 casas decimais
  formatarValor(valor: number): string {
    return Number(valor).toFixed(3);
  }

  // =================================
  // Leituras - Card Superior Direita
  // =================================

  // Formata o DateTime da leitura para ser mostrado na tela Formato: "dd/mm/yyyy - hh:mm"
  formatarDataHora(dataHora: string): string {
    const data = new Date(dataHora);
    const dia = data.toLocaleDateString('pt-BR');
    const hora = data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${dia} - ${hora}`;
  }

  // =========================================
  // Gráficos e Métricas - Card Inferior
  // =========================================

  // Define as opções do MultiBotões de período assim como cor e texto das opções
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
  periodoConsumoSelecionado = signal<PeriodoConsumo>('7d');
  alterarPeriodoConsumo(periodo: string): void {
    this.periodoConsumoSelecionado.set(periodo as PeriodoConsumo);

    this.carregarDadosConsumo();
  }

  // Variável que guarda os dados de consumo do imóvel referentes ao mesmo tipo do medidor atual
  consumo = signal<ConsumoImovel | null>(null);

  // Variável que guarda a comparação do medidor atual com a média de todos os outros medidores do mesmo tipo
  comparacaoGlobal = signal<ComparacaoConsumoMedidor | null>(null);

  // Variável que informa se os dados de consumo ainda estão sendo carregados
  carregandoConsumo = signal(false);

  // Busca simultaneamente os dados utilizados no gráfico e na comparação.
  // Os dois resultados só são atualizados após ambas as requisições terminarem.
  carregarDadosConsumo(): void {
    const medidor = this.medidor();
    if (!medidor) {
      return;
    }

    const periodo = this.periodoConsumoSelecionado();
    const requisicaoAtual = ++this.requisicaoConsumoAtual;
    this.carregandoConsumo.set(true);

    forkJoin({
      consumo: this.imoveisService.buscarConsumo(medidor.imovel.id, medidor.tipo, periodo),
      comparacao: this.medidoresService.buscarComparacaoConsumo(medidor.id, periodo),
    }).subscribe({
      next: ({ consumo, comparacao }) => {
        // Ignora a resposta caso outra troca de período tenha criado uma requisição mais recente
        if (requisicaoAtual !== this.requisicaoConsumoAtual) {
          return;
        }

        this.consumo.set(consumo);
        this.comparacaoGlobal.set(comparacao);
        this.carregandoConsumo.set(false);
      },

      error: (erro) => {
        if (requisicaoAtual !== this.requisicaoConsumoAtual) {
          return;
        }
        console.error('Erro ao carregar dados de consumo:', erro);
        this.carregandoConsumo.set(false);
      },
    });
  }

  // Localiza, dentro dos dados de consumo retornados para o imóvel, somente os consumos pertencentes ao medidor atual
  dadosConsumoMedidor = computed(() => {
    const medidor = this.medidor();
    const consumo = this.consumo();

    if (!medidor || !consumo) {
      return null;
    }

    return consumo.medidores.find((item) => item.id === medidor.id) ?? null;
  });

  // ==========
  // Métricas
  // ==========

  // Soma todo o consumo do medidor durante o período selecionado
  consumoTotal = computed(() => {
    const dados = this.dadosConsumoMedidor();
    if (!dados) {
      return 0;
    }

    const total = dados.consumos.reduce((soma, consumo) => soma + consumo, 0);
    return Number(total.toFixed(3));
  });

  // Calcula a média de consumo por intervalo do período selecionado
  mediaConsumo = computed(() => {
    const dados = this.dadosConsumoMedidor();
    if (!dados || dados.consumos.length === 0) {
      return 0;
    }

    const total = dados.consumos.reduce((soma, consumo) => soma + consumo, 0);
    return Number((total / dados.consumos.length).toFixed(3));
  });

  // Define o título da média de acordo com o período selecionado 24 horas utiliza média por hora, enquanto 7 e 30 dias utilizam média diária
  tituloMediaConsumo = computed(() => {
    if (this.periodoConsumoSelecionado() === '24h') {
      return 'Média por hora';
    }

    return 'Média diária';
  });

  // Localiza o intervalo que apresentou o maior consumo e retorna tanto seu valor quanto seu rótulo
  picoConsumo = computed(() => {
    const dados = this.dadosConsumoMedidor();
    const consumo = this.consumo();
    if (!dados || !consumo || dados.consumos.length === 0) {
      return null;
    }

    let maiorValor = dados.consumos[0];
    let indiceMaiorValor = 0;

    dados.consumos.forEach((valor, indice) => {
      if (valor > maiorValor) {
        maiorValor = valor;
        indiceMaiorValor = indice;
      }
    });

    return {
      valor: Number(maiorValor.toFixed(3)),
      rotulo: consumo.intervalos[indiceMaiorValor]?.rotulo ?? '',
    };
  });

  // Guarda a unidade correspondente ao consumo retornado
  unidadeConsumo = computed(() => this.consumo()?.unidade ?? '');

  // ==================
  // Gráfico de Linha
  // ==================

  // Prepara os dados para o gráfico de linha
  dadosGraficoLinha = computed(() => {
    const consumo = this.consumo();
    const dadosMedidor = this.dadosConsumoMedidor();
    if (!consumo || !dadosMedidor) {
      return [];
    }

    let acumulado = 0;
    const pontos = consumo.intervalos.map((intervalo, indice) => {
      acumulado += dadosMedidor.consumos[indice] ?? 0;

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

  // Separa os rótulos e os valores preparados para o gráfico de linha
  categoriasGraficoLinha = computed(() => this.dadosGraficoLinha().map((item) => item.rotulo));
  valoresGraficoLinha = computed(() => this.dadosGraficoLinha().map((item) => item.consumo));

  // Variável que guarda a cor utilizada no gráfico de acordo com o tipo do medidor
  corGrafico = computed(() => {
    const medidor = this.medidor();

    if (!medidor) {
      return '#000000';
    }

    switch (medidor.tipo) {
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

  // ======================
  // Comparação com a Média
  // ======================

  // Compara o consumo total do medidor atual com a média global dos outros medidores do mesmo tipo
  // Menos de 85% da média -> Abaixo da média
  // Entre 85% e 115%     -> Na média
  // Mais de 115%          -> Acima da média
  comparacaoConsumo = computed(() => {
    const comparacaoGlobal = this.comparacaoGlobal();
    if (
      !comparacaoGlobal ||
      comparacaoGlobal.mediaOutrosMedidores === null ||
      comparacaoGlobal.mediaOutrosMedidores === 0
    ) {
      return null;
    }

    const media = comparacaoGlobal.mediaOutrosMedidores;
    const consumoAtual = this.consumoTotal();
    const percentualDaMedia = (consumoAtual / media) * 100;
    const diferencaPercentual = ((consumoAtual - media) / media) * 100;
    let situacao: 'abaixo' | 'media' | 'acima';
    let descricao: string;
    if (percentualDaMedia < 85) {
      situacao = 'abaixo';
      descricao = 'Abaixo da média';
    } else if (percentualDaMedia > 115) {
      situacao = 'acima';
      descricao = 'Acima da média';
    } else {
      situacao = 'media';
      descricao = 'Na média';
    }

    return {
      media,
      percentualDaMedia,
      diferencaPercentual,
      situacao,
      descricao,
    };
  });

  // Define a posição visual do marcador de acordo com a classificação do consumo
  posicaoIndicador = computed(() => {
    const comparacao = this.comparacaoConsumo();
    if (!comparacao) {
      return 50;
    }

    switch (comparacao.situacao) {
      case 'abaixo':
        return 16.67;
      case 'media':
        return 50;
      case 'acima':
        return 83.33;
    }
  });

  // Cria o texto que informa em percentual quanto o consumo está acima ou abaixo da média dos outros medidores
  textoDiferencaMedia = computed(() => {
    const comparacao = this.comparacaoConsumo();
    if (!comparacao) {
      return '';
    }

    const diferenca = comparacao.diferencaPercentual;
    if (Math.abs(diferenca) < 0.05) {
      return 'Mesmo consumo da média dos outros medidores';
    }

    const percentual = Math.abs(diferenca).toFixed(1);
    if (diferenca > 0) {
      return `${percentual}% acima da média`;
    }

    return `${percentual}% abaixo da média`;
  });
}
