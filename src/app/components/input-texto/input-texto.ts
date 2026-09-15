import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-input-texto',
  styleUrl: './input-texto.css',
  templateUrl: './input-texto.html',
})
export class InputTextoComponent {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'email' | 'password'>('text');
  name = input.required<string>();
  required = input(false);

  erro = input<string>('');
}
