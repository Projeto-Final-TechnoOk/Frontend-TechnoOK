import { Component, input, output } from '@angular/core';

import { BotaoComponent } from '../botao/botao';

@Component({
  selector: 'app-popup-delecao',
  imports: [BotaoComponent],
  templateUrl: './popup-delecao.html',
  styleUrl: './popup-delecao.css',
})
export class PopupDelecaoComponent {
  titulo = input.required<string>();

  mensagem = input.required<string>();

  fechar = output<void>();

  confirmar = output<void>();
}
