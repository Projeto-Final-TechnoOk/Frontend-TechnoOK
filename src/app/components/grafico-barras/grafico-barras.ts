import { Component, computed, input, output } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  NgApexchartsModule,
  ApexPlotOptions,
  ApexFill,
} from 'ng-apexcharts';

@Component({
  imports: [NgApexchartsModule],
  selector: 'app-grafico-barras',
  styleUrl: './grafico-barras.css',
  templateUrl: './grafico-barras.html',
})
export class GraficoBarrasComponent {
  titulo = input<string>('');
  categorias = input.required<string[]>();
  valores = input.required<number[]>();
  nomeSerie = input<string>('Valor');
  unidade = input<string>('');
  altura = input<number>(250);
  cor = input<string>('#008FFB');

  barraClicada = output<string>();

  series = computed<ApexAxisChartSeries>(() => [
    {
      name: this.nomeSerie(),
      data: this.valores(),
    },
  ]);

  chart = computed<ApexChart>(() => ({
    type: 'bar',
    height: this.altura(),
    toolbar: {
      show: false,
    },
    events: {
      dataPointSelection: (_event, _chartContext, config) => {
        if (!config) {
          return;
        }

        const indice = config.dataPointIndex;
        const categoria = this.categorias()[indice];

        if (categoria) {
          this.barraClicada.emit(categoria);
        }
      },
    },
  }));

  plotOptions: ApexPlotOptions = {
    bar: {
      columnWidth: '30%',
      borderRadius: 6,
    },
  };

  fill = computed<ApexFill>(() => ({
    colors: [this.cor()],
  }));

  xaxis = computed<ApexXAxis>(() => ({
    categories: this.categorias(),
  }));
}
