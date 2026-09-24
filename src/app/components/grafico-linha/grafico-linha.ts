import { Component, computed, input } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexYAxis,
  ApexMarkers,
  NgApexchartsModule,
} from 'ng-apexcharts';

@Component({
  imports: [NgApexchartsModule],
  selector: 'app-grafico-linha',
  styleUrl: './grafico-linha.css',
  templateUrl: './grafico-linha.html',
})
export class GraficoLinhaComponent {
  categorias = input.required<string[]>();
  valores = input.required<number[]>();

  nomeSerie = input<string>('Valor');
  unidade = input<string>('');
  altura = input<number>(250);
  cor = input<string>('#008FFB');

  series = computed<ApexAxisChartSeries>(() => [
    {
      name: this.nomeSerie(),
      data: this.valores(),
    },
  ]);

  chart = computed<ApexChart>(() => ({
    type: 'line',
    height: this.altura(),

    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  }));

  stroke: ApexStroke = {
    curve: 'straight',
    width: 3,
  };

  dataLabels: ApexDataLabels = {
    enabled: false,
  };

  markers: ApexMarkers = {
    size: 4,
  };

  colors = computed<string[]>(() => [this.cor()]);

  xaxis = computed<ApexXAxis>(() => ({
    categories: this.categorias(),
  }));

  yaxis = computed<ApexYAxis>(() => ({
    min: 0,

    title: {
      text: this.unidade(),
    },
  }));
}
