import { Component, input, output } from '@angular/core';
import { BotaoComponent } from '../botao/botao';

@Component({
  selector: 'app-formulario',
  imports: [BotaoComponent],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class FormularioComponent {
  titulo = input<string>('');
  erro = input<string>('');

  salvar = output<void>();
  fechar = output<void>();

  cancelar(): void {
    this.fechar.emit();
  }
}
