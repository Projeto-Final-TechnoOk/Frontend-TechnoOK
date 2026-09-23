import { Component, inject, OnInit, signal } from '@angular/core';

import { TabelaComponent, LinhaTabela } from '../../components/tabela/tabela';
import { InputTextoComponent } from '../../components/input-texto/input-texto';
import { BotaoComponent } from '../../components/botao/botao';
import { CardComponent } from '../../components/card/card';

import { LeiturasService } from '../../services/leituras';
import { LeituraListagem } from '../../models/leituras/leitura-listagem';

@Component({
  selector: 'app-leituras',
  imports: [TabelaComponent, InputTextoComponent, BotaoComponent, CardComponent],
  templateUrl: './leituras.html',
  styleUrl: './leituras.css',
})
export class LeiturasPage implements OnInit {
  private readonly leiturasService = inject(LeiturasService);

  leituras = signal<LeituraListagem[]>([]);
  quantidadeLeituras = signal<number>(0);

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
        leitura.medidorIdentificador,
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
}
