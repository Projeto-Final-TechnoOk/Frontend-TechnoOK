import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-botao',
  styleUrl: './botao.css',
  templateUrl: './botao.html',
})
export class BotaoComponent {
  texto = input.required<string>();
  type = input<'button' | 'submit' | 'reset'>('button');
  variante = input<'primario' | 'secundario' | 'perigo' | 'edicao'>();
  desabilitado = input(false);
  larguraTotal = input(false);

  clicado = output<void>();

  aoClicar(): void {
    this.clicado.emit();
  }
}
