import { Component, input } from '@angular/core';

export type TextoTag = 'Energia' | 'Água' | 'Gás';

export type VarianteTag = 'energia' | 'agua' | 'gas';

@Component({
  selector: 'app-tag',
  imports: [],
  templateUrl: './tag.html',
  styleUrl: './tag.css',
})
export class TagComponent {
  texto = input.required<TextoTag>();

  variante = input.required<VarianteTag>();
}
