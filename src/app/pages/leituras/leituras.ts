import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TabelaComponent, LinhaTabela, LinkTabela } from '../../components/tabela/tabela';
import { InputTextoComponent } from '../../components/input-texto/input-texto';
import { BotaoComponent } from '../../components/botao/botao';
import { CardComponent } from '../../components/card/card';
import { PopupDetalhesComponent } from '../../components/popup-detalhes/popup-detalhes';
import { OpcaoSelect, SelectComponent } from '../../components/select/select';
import { FormularioComponent } from '../../components/formulario/formulario';

import { LeiturasService } from '../../services/leituras';
import { MedidoresService } from '../../services/medidores';

import { LeituraListagem } from '../../models/leituras/leitura-listagem';
import { CriarLeituraDto } from '../../models/leituras/criari-leitura.dto';

@Component({
  selector: 'app-leituras',
  imports: [
    TabelaComponent,
    InputTextoComponent,
    BotaoComponent,
    CardComponent,
    PopupDetalhesComponent,
    SelectComponent,
    FormularioComponent,
  ],
  templateUrl: './leituras.html',
  styleUrl: './leituras.css',
})
export class LeiturasPage implements OnInit {
  private readonly leiturasService = inject(LeiturasService);
  private readonly medidoresService = inject(MedidoresService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.carregarLeituras();
  }

  // ======================
  // Formulário de Criação
  // ======================

  // Variável que controla a abertura do formulário de criação
  formularioCriacaoAberto = signal(false);

  // Variáveis que guardam os valores preenchidos no formulário
  medidorFormulario = '';
  valorFormulario = '';
  erroFormulario = '';

  // Guarda as opções de medidores utilizadas no Select do formulário
  opcoesMedidores: OpcaoSelect[] = [];

  // Busca os medidores cadastrados e os transforma em opções para o Select do formulário
  carregarOpcoesMedidores(): void {
    this.medidoresService.listar().subscribe({
      next: (medidores) => {
        this.opcoesMedidores = medidores.map((medidor) => ({
          label: medidor.identificador,

          value: medidor.id,
        }));
      },

      error: (erro) => {
        console.error('Erro ao carregar medidores:', erro);
      },
    });
  }

  // Abre ou fecha o formulário de criação e carrega as opções de medidores quando necessário
  alterarFormularioCriacao(aberto: boolean): void {
    this.erroFormulario = '';

    if (aberto && this.opcoesMedidores.length === 0) {
      this.carregarOpcoesMedidores();
    }

    this.formularioCriacaoAberto.set(aberto);
    this.medidorFormulario = '';
    this.valorFormulario = '';
  }

  // Valida os campos preenchidos e cria uma nova leitura
  // O valor é opcional e, quando não informado, fica sob responsabilidade do backend
  salvarLeitura(): void {
    if (!this.medidorFormulario) {
      this.erroFormulario = 'Selecione um medidor.';
      return;
    }

    const novaLeitura: CriarLeituraDto = {
      medidorId: this.medidorFormulario,
    };

    // Caso um valor seja informado, converte vírgula para ponto e verifica se o valor recebido é numérico
    if (this.valorFormulario.trim()) {
      const valor = Number(this.valorFormulario.replace(',', '.'));
      if (Number.isNaN(valor)) {
        this.erroFormulario = 'Informe um valor válido.';
        return;
      }
      novaLeitura.valor = valor;
    }

    this.erroFormulario = '';

    this.leiturasService.criar(novaLeitura).subscribe({
      next: () => {
        // Após criar uma leitura, retorna para a primeira página para que a leitura mais recente possa ser exibida
        this.paginaAtual.set(1);
        this.carregarLeituras();
      },

      error: (erro) => {
        console.error('Erro ao criar leitura:', erro);
      },
    });
  }

  // =================
  // Tabela e Filtro
  // =================

  // Variável que guarda as leituras carregadas na página atual
  leituras = signal<LeituraListagem[]>([]);

  // Variável que guarda a quantidade total de leituras cadastradas
  quantidadeLeituras = signal<number>(0);

  // Define os cabeçalhos apresentados na tabela
  cabecalhosTabela = ['Data e hora', 'Valor', 'Medidor'];

  // Guarda os dados já preparados para o componente de tabela
  dadosTabela = signal<LinhaTabela[]>([]);

  // Variáveis utilizadas no controle da paginação
  paginaAtual = signal<number>(1);
  limite = signal<number>(100);
  totalPaginas = signal<number>(0);

  // Busca as leituras de forma paginada e atualiza tanto os dados da tabela quanto os dados da paginação
  carregarLeituras(): void {
    this.leiturasService.listarPaginado(this.paginaAtual(), this.limite()).subscribe({
      next: (leituras) => {
        this.leituras.set(leituras.dados);
        this.atualizarTabela(leituras.dados);
        this.quantidadeLeituras.set(leituras.total);
        this.paginaAtual.set(leituras.pagina);
        this.totalPaginas.set(leituras.totalPaginas);
      },

      error: (erro) => {
        console.error('Erro ao carregar leituras:', erro);
      },
    });
  }

  // Transforma a lista de leituras no formato esperado pelo componente genérico de tabela
  atualizarTabela(leituras: LeituraListagem[]): void {
    const dados = leituras.map((leitura) => ({
      id: leitura.id,

      valores: [
        this.formatarDataHora(leitura.dataHora),
        leitura.valor.toString(),
        {
          texto: leitura.medidorIdentificador,
          id: leitura.medidorId,
        } as LinkTabela,
      ],
    }));

    this.dadosTabela.set(dados);
  }

  // Formata o DateTime da leitura para o padrão brasileiro
  formatarDataHora(dataHora: Date): string {
    return new Date(dataHora).toLocaleString('pt-BR');
  }

  // Filtra as leituras carregadas na página atual pelo identificador do medidor ou pela data e hora
  filtrarLeituras(valor: string): void {
    const termo = valor.toLowerCase();
    const filtradas = this.leituras().filter((leitura) => {
      const dataHora = this.formatarDataHora(leitura.dataHora).toLowerCase();
      return leitura.medidorIdentificador.toLowerCase().includes(termo) || dataHora.includes(termo);
    });

    this.atualizarTabela(filtradas);
  }

  // Altera a página atual e busca os novos dados da tabela
  alterarPagina(pagina: number): void {
    this.paginaAtual.set(pagina);
    this.carregarLeituras();
  }

  // Redireciona o usuário para a página específica do medidor relacionado à leitura
  abrirMedidor(id: string): void {
    this.router.navigate(['/medidores', id]);
  }

  // =================
  // Popup de Detalhes
  // =================

  // Variável que controla a abertura do popup de detalhes
  popupResumoAberto = signal(false);

  // Guarda a leitura atualmente selecionada na tabela
  leituraSelecionada: LeituraListagem | null = null;

  // Localiza a leitura selecionada e abre seu popup de detalhes
  abrirResumo(id: string): void {
    const leitura = this.leituras().find((leitura) => leitura.id === id);
    if (!leitura) {
      return;
    }

    this.leituraSelecionada = leitura;
    this.popupResumoAberto.set(true);
  }

  // Fecha o popup e limpa a leitura selecionada
  fecharResumo(): void {
    this.popupResumoAberto.set(false);
    this.leituraSelecionada = null;
  }
}
