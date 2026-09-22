import { Component, inject, OnInit, signal } from '@angular/core';

import { LinhaTabela, TabelaComponent } from '../../components/tabela/tabela';
import { InputTextoComponent } from '../../components/input-texto/input-texto';
import { BotaoComponent } from '../../components/botao/botao';
import { CardComponent } from '../../components/card/card';

import { MedidoresService } from '../../services/medidores';
import { MedidorListagem } from '../../models/medidores/medidor-listagem';

import { TipoMedidor } from '../../enums/medidores/tipo-medidor';
import { TextoTag, VarianteTag } from '../../components/tag/tag';
import { TagComponent } from '../../components/tag/tag';
import { PopupDetalhesComponent } from '../../components/popup-detalhes/popup-detalhes';
import { PopupDelecaoComponent } from '../../components/popup-delecao/popup-delecao';

import { OpcaoSelect, SelectComponent } from '../../components/select/select';
import { ImoveisService } from '../../services/imoveis';
import { FormularioComponent } from '../../components/formulario/formulario';
import { CriarMedidorDto } from '../../models/medidores/criar-medidor.dto';
@Component({
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
  selector: 'app-medidores',
  styleUrl: './medidores.css',
  templateUrl: './medidores.html',
})
export class MedidoresPage implements OnInit {
  private readonly medidoresService = inject(MedidoresService);
  private readonly imoveisService = inject(ImoveisService);

  medidores = signal<MedidorListagem[]>([]);

  ngOnInit(): void {
    this.carregarMedidores();
    this.carregarQuantidade();
  }

  // Topo
  quantidadeMedidores = signal<number>(0);

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

  // Formulário de Criação

  identificadorFormulario = '';
  tipoFormulario: TipoMedidor | '' = '';
  imovelFormulario = '';
  erroFormulario = '';

  formularioCriacaoAberto = signal(false);

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

  opcoesImoveis: OpcaoSelect[] = [];

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

  //Tabela + Filtro
  cabecalhosTabela = ['Identificador', 'Tipo', 'Imóvel'];
  dadosTabela = signal<LinhaTabela[]>([]);

  carregarMedidores(): void {
    this.medidoresService.listar().subscribe({
      next: (medidores) => {
        this.medidores.set(medidores);

        this.atualizarTabela(medidores);
      },

      error: (erro) => {
        console.error('Erro ao carregar medidores:', erro);
      },
    });
  }

  atualizarTabela(medidores: MedidorListagem[]): void {
    const dados = medidores.map((medidor) => ({
      id: medidor.id,

      valores: [medidor.identificador, this.tipoMedidorParaTag(medidor.tipo), medidor.imovelNome],
    }));

    this.dadosTabela.set(dados);
  }

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

  // Popup de Detalhes
  medidorSelecionado: MedidorListagem | null = null;
  popupResumoAberto = signal(false);

  abrirResumo(id: string): void {
    const medidor = this.medidores().find((medidor) => medidor.id === id);

    if (!medidor) {
      return;
    }

    this.medidorSelecionado = medidor;
    this.popupResumoAberto.set(true);
  }

  fecharResumo(): void {
    this.popupResumoAberto.set(false);
    this.medidorSelecionado = null;
  }

  // Formulário de edição
  formularioEdicaoAberto = signal(false);

  // Popup Deleção
  popupDelecaoAberto = signal(false);

  abrirDelecao(): void {
    this.popupDelecaoAberto.set(true);
    this.popupResumoAberto.set(false);
  }

  fecharDelecao(): void {
    this.popupDelecaoAberto.set(false);
  }

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
