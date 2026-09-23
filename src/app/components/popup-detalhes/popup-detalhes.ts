import { Component, input, output } from '@angular/core';
import { BotaoComponent } from '../botao/botao';

@Component({
  selector: 'app-popup-detalhes',
  imports: [BotaoComponent],
  templateUrl: './popup-detalhes.html',
  styleUrl: './popup-detalhes.css',
})
export class PopupDetalhesComponent {
  titulo = input.required<string>();
  mostrarBotoes = input<boolean>(true);

  fechar = output<void>();

  editar = output<void>();

  excluir = output<void>();
}
