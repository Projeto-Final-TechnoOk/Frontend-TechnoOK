import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { LinhaTabela, TabelaComponent } from '../../components/tabela/tabela';
import { InputTextoComponent } from '../../components/input-texto/input-texto';
import { BotaoComponent } from '../../components/botao/botao';
import { CardComponent } from '../../components/card/card';
import { FormularioComponent } from '../../components/formulario/formulario';
import { PopupDetalhesComponent } from '../../components/popup-detalhes/popup-detalhes';
import { PopupDelecaoComponent } from '../../components/popup-delecao/popup-delecao';

import { ImoveisService } from '../../services/imoveis';

import { CriarImovelDto } from '../../models/imoveis/criar-imovel.dto';
import { AtualizarImovelDto } from '../../models/imoveis/atualizar-imovel.dto';
import { Imovel } from '../../models/imoveis/imovel.model';

@Component({
  selector: 'app-imoveis',
  imports: [
    TabelaComponent,
    InputTextoComponent,
    BotaoComponent,
    CardComponent,
    FormularioComponent,
    PopupDetalhesComponent,
    PopupDelecaoComponent,
  ],
  templateUrl: './imoveis.html',
  styleUrl: './imoveis.css',
})
export class ImoveisPage implements OnInit {
  private readonly imoveisService = inject(ImoveisService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.carregarImoveis();
  }

  // =================
  // Topo da Página
  // =================

  // Variável que guarda a quantidade total de imóveis cadastrados
  quantidadeImoveis = signal<number>(0);

  // Busca a quantidade total de imóveis para exibição no topo da página
  carregarQuantidade(): void {
    this.imoveisService.contar().subscribe({
      next: (quantidade) => {
        this.quantidadeImoveis.set(quantidade);
      },

      error: (erro) => {
        console.error('Erro ao carregar quantidade de imóveis:', erro);
      },
    });
  }

  // ======================
  // Formulário de Criação
  // ======================

  // Variáveis que guardam os valores preenchidos no formulário
  nomeFormulario = '';
  enderecoFormulario = '';
  erroFormulario = '';

  // Variável que controla a abertura do formulário de criação
  formularioCriacaoAberto = signal(false);

  // Abre ou fecha os formulários de criação e edição e limpa possíveis mensagens de erro
  alterarFormulario(tipo: 'criacao' | 'edicao', aberto: boolean): void {
    this.erroFormulario = '';

    if (tipo === 'criacao') {
      this.formularioCriacaoAberto.set(aberto);
    }
    if (tipo === 'edicao') {
      this.formularioEdicaoAberto.set(aberto);
    }
  }

  // Valida os campos preenchidos e cria um novo imóvel
  salvarImovel(): void {
    if (!this.nomeFormulario || !this.enderecoFormulario) {
      this.erroFormulario = 'Preencha todos os campos.';
      return;
    }

    this.erroFormulario = '';

    const novoImovel: CriarImovelDto = {
      nome: this.nomeFormulario,
      endereco: this.enderecoFormulario,
    };

    this.imoveisService.criar(novoImovel).subscribe({
      next: (imovelCriado) => {
        const imoveisAtuais = this.imoveis();
        const novaLista = [...imoveisAtuais, imovelCriado];

        this.imoveis.set(novaLista);
        this.atualizarTabela(novaLista);
        this.alterarFormulario('criacao', false);
      },
    });

    this.nomeFormulario = '';
    this.enderecoFormulario = '';
  }

  // =================
  // Tabela e Filtro
  // =================

  // Variável que guarda os imóveis carregados na página atual
  imoveis = signal<Imovel[]>([]);

  // Define os cabeçalhos apresentados na tabela
  cabecalhosTabela = ['Nome', 'Endereço'];

  // Guarda os dados já preparados para o componente de tabela
  dadosTabela = signal<LinhaTabela[]>([]);

  // Variáveis utilizadas no controle da paginação
  paginaAtual = signal<number>(1);
  limite = signal<number>(50);
  totalPaginas = signal<number>(0);

  // Busca os imóveis de forma paginada e atualiza tanto os dados da tabela quanto os dados da paginação
  carregarImoveis(): void {
    this.imoveisService.listarPaginado(this.paginaAtual(), this.limite()).subscribe({
      next: (resposta) => {
        this.imoveis.set(resposta.dados);
        this.atualizarTabela(resposta.dados);
        this.quantidadeImoveis.set(resposta.total);
        this.paginaAtual.set(resposta.pagina);
        this.totalPaginas.set(resposta.totalPaginas);
      },

      error: (erro) => {
        console.error('Erro ao carregar imóveis:', erro);
      },
    });
  }

  // Transforma a lista de imóveis no formato esperado pelo componente genérico de tabela
  atualizarTabela(imoveis: Imovel[]): void {
    const dados = imoveis.map((imovel) => ({
      id: imovel.id,
      valores: [imovel.nome, imovel.endereco],
    }));
    this.dadosTabela.set(dados);
  }

  // Filtra os imóveis carregados na página atual pelo nome ou endereço
  filtrarImoveis(valor: string): void {
    const termo = valor.toLowerCase();
    const filtrados = this.imoveis().filter(
      (imovel) =>
        imovel.nome.toLowerCase().includes(termo) || imovel.endereco.toLowerCase().includes(termo),
    );

    this.atualizarTabela(filtrados);
  }

  // Altera a página atual e busca os novos dados da tabela
  alterarPagina(pagina: number): void {
    this.paginaAtual.set(pagina);
    this.carregarImoveis();
  }

  // Redireciona o usuário para a página específica do imóvel selecionado
  abrirImovel(id: string): void {
    this.router.navigate(['/imoveis', id]);
  }

  // =================
  // Popup de Detalhes
  // =================

  // Variável que controla a abertura do popup de detalhes
  popupResumoAberto = signal(false);

  // Guarda o imóvel atualmente selecionado na tabela
  imovelSelecionado: Imovel | null = null;

  // Localiza o imóvel selecionado e abre seu popup de detalhes
  abrirResumo(id: string): void {
    const imovel = this.imoveis().find((imovel) => imovel.id === id);
    if (!imovel) {
      return;
    }

    this.imovelSelecionado = imovel;
    this.popupResumoAberto.set(true);
  }

  // Fecha o popup e limpa o imóvel selecionado
  fecharResumo(): void {
    this.popupResumoAberto.set(false);
    this.imovelSelecionado = null;
  }

  // =====================
  // Formulário de Edição
  // =====================

  // Variável que controla a abertura do formulário de edição
  formularioEdicaoAberto = signal(false);

  // Abre o formulário de edição e preenche os campos com os dados do imóvel selecionado
  abrirEdicao(): void {
    if (!this.imovelSelecionado) {
      return;
    }

    this.nomeFormulario = this.imovelSelecionado.nome;
    this.enderecoFormulario = this.imovelSelecionado.endereco;
    this.alterarFormulario('edicao', true);
    this.popupResumoAberto.set(false);
  }

  // Atualiza os dados do imóvel selecionado
  editarImovel(): void {
    if (!this.imovelSelecionado) {
      return;
    }

    const imovelAtualizado: AtualizarImovelDto = {
      nome: this.nomeFormulario,
      endereco: this.enderecoFormulario,
    };
    const id = this.imovelSelecionado.id;

    this.imoveisService.atualizar(id, imovelAtualizado).subscribe({
      next: (imovelAtualizadoBackend) => {
        const imoveisAtuais = this.imoveis();
        const novaLista = imoveisAtuais.map((imovel) => {
          if (imovel.id === id) {
            return imovelAtualizadoBackend;
          }

          return imovel;
        });

        this.imoveis.set(novaLista);
        this.atualizarTabela(novaLista);
        this.alterarFormulario('edicao', false);
        this.imovelSelecionado = null;
        this.nomeFormulario = '';
        this.enderecoFormulario = '';
        this.erroFormulario = '';
      },

      error: (erro) => {
        console.error('Erro ao atualizar imóvel:', erro);
      },
    });
  }

  // =================
  // Popup de Deleção
  // =================

  // Variável que controla a abertura do popup de confirmação da deleção
  popupDelecaoAberto = signal(false);

  // Guarda a mensagem de erro retornada caso o imóvel não possa ser excluído
  erroDelecao = signal<string>('');

  // Abre o popup de deleção, limpa mensagens anteriores e fecha o popup de detalhes
  abrirDelecao(): void {
    this.erroDelecao.set('');
    this.popupDelecaoAberto.set(true);
    this.popupResumoAberto.set(false);
  }

  // Fecha o popup de deleção e limpa possíveis mensagens de erro
  fecharDelecao(): void {
    this.erroDelecao.set('');
    this.popupDelecaoAberto.set(false);
  }

  // Exclui o imóvel selecionado e atualiza os dados apresentados na página
  confirmarDelecao(): void {
    if (!this.imovelSelecionado) {
      return;
    }

    const id = this.imovelSelecionado.id;

    this.imoveisService.deletar(id).subscribe({
      next: () => {
        const imoveisAtuais = this.imoveis();
        const novaLista = imoveisAtuais.filter((imovel) => imovel.id !== id);
        this.imoveis.set(novaLista);

        this.atualizarTabela(novaLista);
        this.carregarQuantidade();
        this.fecharDelecao();
        this.fecharResumo();
      },

      error: (erro) => {
        this.erroDelecao.set(erro.error?.message ?? 'Não foi possível excluir o imóvel.');
        console.error('Erro ao excluir imóvel:', erro);
      },
    });
  }
}
