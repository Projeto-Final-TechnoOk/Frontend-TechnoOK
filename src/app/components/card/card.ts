import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SetaComponent } from '../seta/seta';

@Component({
  imports: [RouterLink, SetaComponent],
  selector: 'app-card',
  styleUrl: './card.css',
  templateUrl: './card.html',
})
export class CardComponent {
  titulo = input<string>('');
  subtitulo = input<string>('');
  redirecionamento = input<string>('');
}
