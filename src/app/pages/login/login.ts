import { Component, inject } from '@angular/core';
import { BotaoComponent } from '../../components/botao/botao';
import { InputTextoComponent } from '../../components/input-texto/input-texto';
import { Router } from '@angular/router';

@Component({
  imports: [BotaoComponent, InputTextoComponent],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly router = inject(Router);

  entrar(): void {
    this.router.navigate(['/dashboard']);
  }
}
