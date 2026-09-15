import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-card',
  styleUrl: './card.css',
  templateUrl: './card.html',
})
export class CardComponent {
  titulo = input<string>('');
  subtitulo = input<string>('');
  redirecionamento = input<string>('');
}
