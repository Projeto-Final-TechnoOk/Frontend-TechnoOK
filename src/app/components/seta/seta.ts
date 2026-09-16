import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-seta',
  templateUrl: './seta.html',
  styleUrl: './seta.css',
})
export class SetaComponent {
  tipo = input<'esquerda' | 'direita'>('direita');

  clicada = output<void>();
}
