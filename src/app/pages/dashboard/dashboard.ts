import { Component, inject, OnInit, signal } from '@angular/core';
import { CardComponent } from '../../components/card/card';
import { DashboardService } from '../../services/DashboardService';
import { DashboardResumo } from '../../models/dashboard/dashboard-resumo..model';

@Component({
  imports: [CardComponent],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  resumo = signal<DashboardResumo | undefined>(undefined);

  ngOnInit(): void {
    this.carregarResumo();
  }

  carregarResumo(): void {
    this.dashboardService.obterResumo().subscribe({
      next: (dados) => {
        this.resumo.set(dados);
      },
      error: (erro) => {
        console.error('Erro ao carregar resumo do dashboard:', erro);
      },
    });
  }
}
