import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { LinhaTabela, LinkTabela, TabelaComponent } from '../../components/tabela/tabela';
import { InputTextoComponent } from '../../components/input-texto/input-texto';
import { BotaoComponent } from '../../components/botao/botao';
import { CardComponent } from '../../components/card/card';
import { TextoTag, VarianteTag, TagComponent } from '../../components/tag/tag';
import { PopupDetalhesComponent } from '../../components/popup-detalhes/popup-detalhes';
import { PopupDelecaoComponent } from '../../components/popup-delecao/popup-delecao';
import { OpcaoSelect, SelectComponent } from '../../components/select/select';
import { FormularioComponent } from '../../components/formulario/formulario';

import { MedidoresService } from '../../services/medidores';
import { ImoveisService } from '../../services/imoveis';

import { MedidorListagem } from '../../models/medidores/medidor-listagem';
import { CriarMedidorDto } from '../../models/medidores/criar-medidor.dto';
import { AtualizarMedidorDto } from '../../models/medidores/atualizar-medidor.dto';
import { TipoMedidor } from '../../enums/medidores/tipo-medidor';

@Component({
  selector: 'app-medidores',
  imports: [
    TabelaComponent,
    InputTextoComponent,
    BotaoComponent,
    CardComponent,
    PopupDetalhesComponent,
    TagComponent,
    PopupDelecaoComponent,
    FormularioComponent,
    SelectComponent,
  ],
  templateUrl: './medidores.html',
  styleUrl: './medidores.css',
})
export class MedidoresPage implements OnInit {
  private readonly medidoresService = inject(MedidoresService);
  private readonly imoveisService = inject(ImoveisService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.carregarMedidores();
    this.carregarQuantidade();
  }

  // =================
  // Topo da Página
  // =================

  // Variável que guarda a quantidade total de medidores cadastrados
  quantidadeMedidores = signal<number>(0);

  // Busca a quantidade total de medidores para exibição no topo da página
  carregarQuantidade(): void {
    this.medidoresService.contar().subscribe({
      next: (quantidade) => {
        this.quantidadeMedidores.set(quantidade);
      },

      error: (erro) => {
        console.error('Erro ao carregar quantidade de medidores:', erro);
      },
    });
  }

  // ======================
  // Formulário de Criação
  // ======================

  // Variáveis que guardam os valores preenchidos no formulário
  identificadorFormulario = '';
  tipoFormulario: TipoMedidor | '' = '';
  imovelFormulario = '';
  erroFormulario = '';

  // Variável que controla a abertura do formulário de criação
  formularioCriacaoAberto = signal(false);

  // Define as opções disponíveis no Select de tipo do medidor
  opcoesTipoMedidor: OpcaoSelect[] = [
    {
      label: 'Energia',
      value: TipoMedidor.ENERGIA,
    },

    {
      label: 'Água',
      value: TipoMedidor.AGUA,
    },

    {
      label: 'Gás',
      value: TipoMedidor.GAS,
    },
  ];

  // Guarda as opções de imóveis utilizadas no Select do formulário
  opcoesImoveis: OpcaoSelect[] = [];

  // Abre ou fecha os formulários de criação e edição e carrega as opções de imóveis quando necessário
  alterarFormulario(tipo: 'criacao' | 'edicao', aberto: boolean): void {
    this.erroFormulario = '';

    if (this.opcoesImoveis.length === 0) {
      this.carregarOpcoesImoveis();
    }
    if (tipo === 'criacao') {
      this.formularioCriacaoAberto.set(aberto);
    }
    if (tipo === 'edicao') {
      this.formularioEdicaoAberto.set(aberto);
    }
  }

  // Busca os imóveis cadastrados e os transforma em opções para o Select do formulário
  carregarOpcoesImoveis(): void {
    this.imoveisService.listar().subscribe({
      next: (imoveis) => {
        this.opcoesImoveis = imoveis.map((imovel) => ({
          label: imovel.nome,
          value: imovel.id,
        }));
      },

      error: (erro) => {
        console.error('Erro ao carregar imóveis:', erro);
      },
    });
  }

  // Valida os campos preenchidos e cria um novo medidor
  salvarMedidor(): void {
    if (!this.identificadorFormulario || !this.tipoFormulario || !this.imovelFormulario) {
      this.erroFormulario = 'Preencha todos os campos.';
      return;
    }

    this.erroFormulario = '';
    const novoMedidor: CriarMedidorDto = {
      identificador: this.identificadorFormulario,
      tipo: this.tipoFormulario,
      imovelId: this.imovelFormulario,
    };

    this.medidoresService.criar(novoMedidor).subscribe({
      next: () => {
        this.carregarMedidores();
        this.carregarQuantidade();
        this.alterarFormulario('criacao', false);
      },

      error: (erro) => {
        console.error('Erro ao criar medidor:', erro);
      },
    });

    this.identificadorFormulario = '';
    this.tipoFormulario = '';
    this.imovelFormulario = '';
  }

  // =================
  // Tabela e Filtro
  // =================

  // Variável que guarda os medidores carregados na página atual
  medidores = signal<MedidorListagem[]>([]);

  // Define os cabeçalhos apresentados na tabela
  cabecalhosTabela = ['Identificador', 'Tipo', 'Imóvel'];

  // Guarda os dados já preparados para o componente de tabela
  dadosTabela = signal<LinhaTabela[]>([]);

  // Variáveis utilizadas no controle da paginação
  paginaAtual = signal<number>(1);
  limite = signal<number>(50);
  totalPaginas = signal<number>(0);

  // Busca os medidores de forma paginada e atualiza tanto os dados da tabela quanto os dados da paginação
  carregarMedidores(): void {
    this.medidoresService.listarPaginado(this.paginaAtual(), this.limite()).subscribe({
      next: (medidores) => {
        this.medidores.set(medidores.dados);
        this.atualizarTabela(medidores.dados);
        this.quantidadeMedidores.set(medidores.total);
        this.paginaAtual.set(medidores.pagina);
        this.totalPaginas.set(medidores.totalPaginas);
      },

      error: (erro) => {
        console.error('Erro ao carregar medidores:', erro);
      },
    });
  }

  // Transforma a lista de medidores no formato esperado pelo componente genérico de tabela
  atualizarTabela(medidores: MedidorListagem[]): void {
    const dados = medidores.map((medidor) => ({
      id: medidor.id,

      valores: [
        medidor.identificador,
        this.tipoMedidorParaTag(medidor.tipo),
        {
          texto: medidor.imovelNome,
          id: medidor.imovelId,
        } as LinkTabela,
      ],
    }));

    this.dadosTabela.set(dados);
  }

  // Filtra os medidores carregados na página atual por identificador, tipo ou nome do imóvel
  filtrarMedidores(valor: string): void {
    const termo = valor.toLowerCase();
    const filtrados = this.medidores().filter(
      (medidor) =>
        medidor.identificador.toLowerCase().includes(termo) ||
        medidor.tipo.toLowerCase().includes(termo) ||
        medidor.imovelNome.toLowerCase().includes(termo),
    );

    this.atualizarTabela(filtrados);
  }

  // Converte o tipo do medidor para o formato utilizado pelo componente de Tag
  tipoMedidorParaTag(tipo: TipoMedidor): {
    texto: TextoTag;
    variante: VarianteTag;
  } {
    switch (tipo) {
      case TipoMedidor.ENERGIA:
        return {
          texto: 'Energia',
          variante: 'energia',
        };
      case TipoMedidor.AGUA:
        return {
          texto: 'Água',
          variante: 'agua',
        };
      case TipoMedidor.GAS:
        return {
          texto: 'Gás',
          variante: 'gas',
        };
    }
  }

  // Redireciona o usuário para a página específica do medidor selecionado
  abrirMedidor(id: string): void {
    this.router.navigate(['/medidores', id]);
  }

  // Redireciona o usuário para a página específica do imóvel relacionado ao medidor
  abrirImovel(id: string): void {
    this.router.navigate(['/imoveis', id]);
  }

  // Altera a página atual e busca os novos dados da tabela
  alterarPagina(pagina: number): void {
    this.paginaAtual.set(pagina);
    this.carregarMedidores();
  }

  // =================
  // Popup de Detalhes
  // =================

  // Guarda o medidor atualmente selecionado na tabela
  medidorSelecionado: MedidorListagem | null = null;

  // Variável que controla a abertura do popup de detalhes
  popupResumoAberto = signal(false);

  // Localiza o medidor selecionado e abre seu popup de detalhes
  abrirResumo(id: string): void {
    const medidor = this.medidores().find((medidor) => medidor.id === id);
    if (!medidor) {
      return;
    }

    this.medidorSelecionado = medidor;
    this.popupResumoAberto.set(true);
  }

  // Fecha o popup e limpa o medidor selecionado
  fecharResumo(): void {
    this.popupResumoAberto.set(false);
    this.medidorSelecionado = null;
  }

  // =====================
  // Formulário de Edição
  // =====================

  // Variável que controla a abertura do formulário de edição
  formularioEdicaoAberto = signal(false);

  // Abre o formulário de edição e preenche os campos com os dados do medidor selecionado
  abrirEdicao(): void {
    if (!this.medidorSelecionado) {
      return;
    }

    this.formularioEdicaoAberto.set(true);
    this.identificadorFormulario = this.medidorSelecionado.identificador;
    this.tipoFormulario = this.medidorSelecionado.tipo;
    this.imovelFormulario = this.medidorSelecionado.imovelId;
    this.popupResumoAberto.set(false);
  }

  // Valida os campos e atualiza os dados do medidor selecionado
  editarMedidor(): void {
    if (!this.medidorSelecionado) {
      return;
    }
    if (!this.identificadorFormulario || !this.tipoFormulario || !this.imovelFormulario) {
      this.erroFormulario = 'Preencha todos os campos.';
      return;
    }

    this.erroFormulario = '';

    const medidorAtualizado: AtualizarMedidorDto = {
      identificador: this.identificadorFormulario,
      tipo: this.tipoFormulario,
      imovelId: this.imovelFormulario,
    };
    const id = this.medidorSelecionado.id;

    this.medidoresService.atualizar(id, medidorAtualizado).subscribe({
      next: (medidorAtualizadoBackend) => {
        const medidoresAtuais = this.medidores();
        const novaLista = medidoresAtuais.map((medidor) => {
          if (medidor.id === id) {
            return {
              ...medidor,
              identificador: medidorAtualizadoBackend.identificador,
              tipo: medidorAtualizadoBackend.tipo,
              imovelId: medidorAtualizadoBackend.imovel.id,
              imovelNome: medidorAtualizadoBackend.imovel.nome,
            };
          }
          return medidor;
        });

        this.medidores.set(novaLista);
        this.atualizarTabela(novaLista);
        this.alterarFormulario('edicao', false);

        this.medidorSelecionado = null;
        this.identificadorFormulario = '';
        this.tipoFormulario = '';
        this.imovelFormulario = '';
        this.erroFormulario = '';
      },

      error: (erro) => {
        console.error('Erro ao atualizar medidor:', erro);
      },
    });
  }

  // =================
  // Popup de Deleção
  // =================

  // Variável que controla a abertura do popup de confirmação da deleção
  popupDelecaoAberto = signal(false);

  // Abre o popup de deleção e fecha o popup de detalhes
  abrirDelecao(): void {
    this.popupDelecaoAberto.set(true);
    this.popupResumoAberto.set(false);
  }

  // Fecha o popup de confirmação da deleção
  fecharDelecao(): void {
    this.popupDelecaoAberto.set(false);
  }

  // Exclui o medidor selecionado e atualiza os dados apresentados na página
  confirmarDelecao(): void {
    if (!this.medidorSelecionado) {
      return;
    }

    const id = this.medidorSelecionado.id;

    this.medidoresService.deletar(id).subscribe({
      next: () => {
        const medidoresAtuais = this.medidores();
        const novaLista = medidoresAtuais.filter((medidor) => medidor.id !== id);
        this.medidores.set(novaLista);

        this.atualizarTabela(novaLista);
        this.carregarQuantidade();
        this.fecharDelecao();
        this.fecharResumo();
      },

      error: (erro) => {
        console.error('Erro ao excluir medidor:', erro);
      },
    });
  }
}
