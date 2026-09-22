import { Component, input, output } from '@angular/core';
import { SetaComponent } from '../seta/seta';
import { TagComponent, TextoTag, VarianteTag } from '../tag/tag';

export interface TagTabela {
  texto: TextoTag;
  variante: VarianteTag;
}
export interface LinhaTabela {
  id: string;
  valores: (string | TagTabela | LinkTabela)[];
}

export interface LinkTabela {
  texto: string;
  id: string;
}
@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.html',
  styleUrl: './tabela.css',
  imports: [SetaComponent, TagComponent],
})
export class TabelaComponent {
  cabecalhos = input.required<string[]>();
  dados = input.required<LinhaTabela[]>();

  mensagemVazia = input<string>('Nenhum registro encontrado.');
  linhaClicavel = input(true);

  linkClicado = output<string>();
  linhaClicada = output<string>();
  navegarClicado = output<string>();

  ehTag(valor: string | TagTabela | LinkTabela): valor is TagTabela {
    return typeof valor !== 'string' && 'variante' in valor;
  }

  ehLink(valor: string | TagTabela | LinkTabela): valor is LinkTabela {
    return typeof valor !== 'string' && 'id' in valor;
  }
}
