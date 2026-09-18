import { Component, input, output } from '@angular/core';
import { SetaComponent } from '../seta/seta';

export interface LinhaTabela {
  id: string;
  valores: string[];
}

@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.html',
  styleUrl: './tabela.css',
  imports: [SetaComponent],
})
export class TabelaComponent {
  cabecalhos = input.required<string[]>();
  dados = input.required<LinhaTabela[]>();

  mensagemVazia = input<string>('Nenhum registro encontrado.');

  linhaClicada = output<string>();
  navegarClicado = output<string>();
}
