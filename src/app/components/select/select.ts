import { Component, input, output, signal, computed } from '@angular/core';

export interface OpcaoSelect {
  label: string;
  value: string;
  tipo?: string;
}

@Component({
  imports: [],
  selector: 'app-select',
  styleUrl: './select.css',
  templateUrl: './select.html',
})
export class SelectComponent {
  label = input<string>('');

  placeholder = input<string>('Selecione');

  opcoes = input.required<OpcaoSelect[]>();

  valor = input<string>('');

  valorAlterado = output<string>();

  aberto = signal(false);

  busca = signal('');

  opcoesFiltradas = computed(() => {
    const termo = this.busca().toLowerCase().trim();

    if (!termo) {
      return this.opcoes();
    }

    return this.opcoes().filter((opcao) => opcao.label.toLowerCase().includes(termo));
  });

  alternar(): void {
    this.aberto.update((aberto) => !aberto);

    if (this.aberto()) {
      this.busca.set('');
    }
  }

  selecionar(opcao: OpcaoSelect): void {
    this.valorAlterado.emit(opcao.value);
    this.aberto.set(false);
    this.busca.set('');
  }

  alterarBusca(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.busca.set(input.value);
  }

  opcaoSelecionada(): OpcaoSelect | undefined {
    return this.opcoes().find((opcao) => opcao.value === this.valor());
  }
}
