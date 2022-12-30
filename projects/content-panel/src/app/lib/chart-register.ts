// https://github.com/sgratzl/chartjs-chart-wordcloud/issues/4
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

export function registerPluginToChart() {
  Chart.register(...registerables);
  Chart.register(annotationPlugin);
}
