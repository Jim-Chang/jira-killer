import { registerPluginToChart } from '../../lib/chart-register';
import { BurnUpChartData, IssueStatus, JiraSprint } from '../../lib/define';
import { ChartService } from '../../services/chart-service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import * as moment from 'moment';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.sass'],
})
export class ChartComponent {
  @ViewChild('burnUpChart') burnUpChart: ElementRef;

  sprint: JiraSprint;

  private isCalculating = false;
  private chart: Chart;

  get enableCalBtn(): boolean {
    return !this.isCalculating && !!this.sprint;
  }

  constructor(private chartService: ChartService) {
    registerPluginToChart();
  }

  onClickCalculate(): void {
    if (this.sprint.startDate && this.sprint.endDate) {
      this.isCalculating = true;
      this.chartService.getBurnUpChartData(this.sprint).subscribe((data) => {
        this.drawBurnUpChart(data);
        this.isCalculating = false;
      });
    } else {
      console.log("This sprint didn't set startDate or endDate.");
    }
  }

  private drawBurnUpChart(burnUpChartData: BurnUpChartData): void {
    const dayCount = this.chartService.getDayDiff(this.sprint.startDate as string, this.sprint.endDate as string) + 1;

    const data = {
      labels: [...Array(dayCount).keys()].map((i) => i + 1),
      datasets: [
        {
          label: 'Commitment',
          data: Array(dayCount).fill(burnUpChartData.totalPoints),
          borderColor: 'red',
          yAxisID: 'y',
        },
        {
          label: 'Burn Up Ref',
          data: burnUpChartData.refBurnUpLine,
          borderColor: 'gray',
          yAxisID: 'y',
        },
        {
          label: IssueStatus.InReview,
          data: burnUpChartData[IssueStatus.InReview],
          borderColor: 'orange',
          yAxisID: 'y',
        },
        {
          label: IssueStatus.ReadyForVerification,
          data: burnUpChartData[IssueStatus.ReadyForVerification],
          borderColor: 'blue',
          yAxisID: 'y',
        },
        {
          label: IssueStatus.Closed,
          data: burnUpChartData[IssueStatus.Closed],
          borderColor: 'green',
          yAxisID: 'y',
        },
      ],
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        stacked: false,
        plugins: {
          title: {
            display: true,
            text: 'Burn Up Chart',
          },
          annotation: {},
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
          },
        },
      },
    };

    const today = moment();
    if (this.chartService.isDateInSprint(today, this.sprint)) {
      const dayDeltaOfToday = this.chartService.getDayDiff(this.sprint.startDate as string, moment());
      config.options.plugins.annotation = {
        annotations: {
          vLine: {
            type: 'line',
            xMin: dayDeltaOfToday,
            xMax: dayDeltaOfToday,
            borderColor: 'red',
          },
        },
      };
    }

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(this.burnUpChart.nativeElement, config as any);
  }
}
