import { Component, input, output } from '@angular/core';

export interface OpcaoSelect {
  label: string;
  value: string;
  tipo?: string;
}

@Component({
  imports: [],
  selector: 'app-select',
  styleUrl: './select.css',
  templateUrl: './select.html',
})
export class SelectComponent {
  label = input<string>('');
  placeholder = input<string>('Selecione');
  opcoes = input.required<OpcaoSelect[]>();
  valor = input<string>('');

  valorAlterado = output<string>();

  aoAlterar(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.valorAlterado.emit(select.value);
  }
}
