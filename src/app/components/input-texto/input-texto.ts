import { Component, input, output } from '@angular/core';

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

  valor = input<string>('');

  valorAlterado = output<string>();
  erro = input<string>('');
}
