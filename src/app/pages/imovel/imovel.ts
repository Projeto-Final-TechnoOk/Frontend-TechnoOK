import { ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';

import { ImoveisService } from '../../services/imoveis';
import { Imovel } from '../../models/imoveis/imovel.model';

@Component({
  selector: 'app-imovel',
  imports: [],
  templateUrl: './imovel.html',
  styleUrl: './imovel.css',
})
export class ImovelPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly imoveisService = inject(ImoveisService);

  imovel: Imovel | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.carregarImovel(id);
  }

  carregarImovel(id: string): void {
    this.imoveisService.buscarPorId(id).subscribe({
      next: (imovel) => {
        this.imovel = imovel;
      },

      error: (erro) => {
        console.error('Erro ao carregar imóvel:', erro);
      },
    });
  }
}
