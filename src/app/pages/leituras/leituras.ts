import { Component, inject, OnInit, signal } from '@angular/core';
import { TabelaComponent, LinhaTabela, LinkTabela } from '../../components/tabela/tabela';
import { InputTextoComponent } from '../../components/input-texto/input-texto';
import { BotaoComponent } from '../../components/botao/botao';
import { CardComponent } from '../../components/card/card';
import { Router } from '@angular/router';
import { LeiturasService } from '../../services/leituras';
import { LeituraListagem } from '../../models/leituras/leitura-listagem';
import { PopupDetalhesComponent } from '../../components/popup-detalhes/popup-detalhes';
import { MedidoresService } from '../../services/medidores';
import { OpcaoSelect, SelectComponent } from '../../components/select/select';
import { CriarLeituraDto } from '../../models/leituras/criari-leitura.dto';
import { FormularioComponent } from '../../components/formulario/formulario';

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

  leituras = signal<LeituraListagem[]>([]);
  quantidadeLeituras = signal<number>(0);

  // Formulário de criação

  formularioCriacaoAberto = signal(false);

  medidorFormulario = '';

  valorFormulario = '';

  erroFormulario = '';

  opcoesMedidores: OpcaoSelect[] = [];

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

  alterarFormularioCriacao(aberto: boolean): void {
    this.erroFormulario = '';

    if (aberto && this.opcoesMedidores.length === 0) {
      this.carregarOpcoesMedidores();
    }

    this.formularioCriacaoAberto.set(aberto);
    this.medidorFormulario = '';
    this.valorFormulario = '';
  }

  salvarLeitura(): void {
    if (!this.medidorFormulario) {
      this.erroFormulario = 'Selecione um medidor.';
      return;
    }

    const novaLeitura: CriarLeituraDto = {
      medidorId: this.medidorFormulario,
    };

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
        this.paginaAtual.set(1);
        this.carregarLeituras();
      },

      error: (erro) => {
        console.error('Erro ao criar leitura:', erro);
      },
    });
  }

  // Tabela

  paginaAtual = signal<number>(1);
  limite = signal<number>(100);
  totalPaginas = signal<number>(0);

  cabecalhosTabela = ['Data e hora', 'Valor', 'Medidor'];

  dadosTabela = signal<LinhaTabela[]>([]);

  ngOnInit(): void {
    this.carregarLeituras();
  }

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

  formatarDataHora(dataHora: Date): string {
    return new Date(dataHora).toLocaleString('pt-BR');
  }

  filtrarLeituras(valor: string): void {
    const termo = valor.toLowerCase();

    const filtradas = this.leituras().filter((leitura) => {
      const dataHora = this.formatarDataHora(leitura.dataHora).toLowerCase();

      return leitura.medidorIdentificador.toLowerCase().includes(termo) || dataHora.includes(termo);
    });

    this.atualizarTabela(filtradas);
  }

  alterarPagina(pagina: number): void {
    this.paginaAtual.set(pagina);

    this.carregarLeituras();
  }

  abrirMedidor(id: string): void {
    this.router.navigate(['/medidores', id]);
  }

  // Popup de detalhes

  popupResumoAberto = signal(false);

  leituraSelecionada: LeituraListagem | null = null;

  abrirResumo(id: string): void {
    const leitura = this.leituras().find((leitura) => leitura.id === id);

    if (!leitura) {
      return;
    }

    this.leituraSelecionada = leitura;
    this.popupResumoAberto.set(true);
  }

  fecharResumo(): void {
    this.popupResumoAberto.set(false);
    this.leituraSelecionada = null;
  }
}
