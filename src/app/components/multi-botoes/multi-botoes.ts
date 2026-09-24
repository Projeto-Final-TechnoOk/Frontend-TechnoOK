import { Component, input, output } from '@angular/core';

export interface OpcaoMultiBotoes {
  label: string;
  value: string;
  corAtiva?: string;
  corTextoAtivo?: string;
}

@Component({
  selector: 'app-multi-botoes',
  imports: [],
  templateUrl: './multi-botoes.html',
  styleUrl: './multi-botoes.css',
})
export class MultiBotoesComponent {
  opcoes = input.required<OpcaoMultiBotoes[]>();
  valorSelecionado = input.required<string>();

  valorAlterado = output<string>();

  selecionar(valor: string): void {
    this.valorAlterado.emit(valor);
  }
}
