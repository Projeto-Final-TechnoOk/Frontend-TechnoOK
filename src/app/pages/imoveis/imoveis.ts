import { Component, inject, OnInit, signal } from '@angular/core';

import { LinhaTabela, TabelaComponent } from '../../components/tabela/tabela';
import { ImoveisService, Imovel } from '../../services/imoveis';
import { InputTextoComponent } from '../../components/input-texto/input-texto';
import { BotaoComponent } from '../../components/botao/botao';
import { CardComponent } from '../../components/card/card';
import { FormularioComponent } from '../../components/formulario/formulario';
import { CriarImovelDto } from '../../models/imoveis/criar-imovel.dto';
import { PopupDetalhesComponent } from '../../components/popup-detalhes/popup-detalhes';
import { PopupDelecaoComponent } from '../../components/popup-delecao/popup-delecao';
@Component({
  imports: [
    TabelaComponent,
    InputTextoComponent,
    BotaoComponent,
    CardComponent,
    FormularioComponent,
    PopupDetalhesComponent,
    PopupDelecaoComponent,
  ],
  selector: 'app-imoveis',
  styleUrl: './imoveis.css',
  templateUrl: './imoveis.html',
})
export class ImoveisPage implements OnInit {
  private readonly imoveisService = inject(ImoveisService);

  imoveis = signal<Imovel[]>([]);

  ngOnInit(): void {
    this.carregarImoveis();
    this.carregarQuantidade();
  }

  // Topo
  quantidadeImoveis = signal<number>(0);

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

  // Criação

  nomeFormulario = '';
  enderecoFormulario = '';

  erroFormulario = '';

  formularioCriacaoAberto = signal(false);
  formularioEdicaoAberto = signal(false);

  alterarFormulario(tipo: 'criacao' | 'edicao', aberto: boolean) {
    this.erroFormulario = '';
    if (tipo === 'criacao') {
      this.formularioCriacaoAberto.set(aberto);
    }

    if (tipo === 'edicao') {
      this.formularioEdicaoAberto.set(aberto);
    }
  }

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

  // Tabela + Filtro

  cabecalhosTabela = ['Nome', 'Endereço'];
  dadosTabela = signal<LinhaTabela[]>([]);

  carregarImoveis(): void {
    this.imoveisService.listar().subscribe({
      next: (imoveis) => {
        this.imoveis.set(imoveis);
        this.atualizarTabela(imoveis);
      },
      error: (erro) => {
        console.error('Erro ao carregar imóveis:', erro);
      },
    });
  }

  atualizarTabela(imoveis: Imovel[]): void {
    const dados = imoveis.map((imovel) => ({
      id: imovel.id,
      valores: [imovel.nome, imovel.endereco],
    }));

    this.dadosTabela.set(dados);
  }

  filtrarImoveis(valor: string): void {
    const termo = valor.toLowerCase();

    const filtrados = this.imoveis().filter(
      (imovel) =>
        imovel.nome.toLowerCase().includes(termo) || imovel.endereco.toLowerCase().includes(termo),
    );

    this.atualizarTabela(filtrados);
  }

  abrirImovel(id: string): void {
    console.log('Abrir página do imóvel:', id);
  }

  // Popup de detalhes
  popupResumoAberto = signal(false);
  imovelSelecionado: Imovel | null = null;

  abrirResumo(id: string): void {
    const imovel = this.imoveis().find((imovel) => imovel.id === id);
    if (!imovel) {
      return;
    }

    this.imovelSelecionado = imovel;
    this.popupResumoAberto.set(true);
  }

  fecharResumo(): void {
    this.popupResumoAberto.set(false);
    this.imovelSelecionado = null;
  }

  // Popup de deleção

  popupDelecaoAberto = signal(false);

  abrirDelecao(): void {
    this.popupDelecaoAberto.set(true);
    this.popupResumoAberto.set(false);
  }

  fecharDelecao(): void {
    this.popupDelecaoAberto.set(false);
  }

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
        console.error('Erro ao excluir imóvel:', erro);
      },
    });
  }
}
