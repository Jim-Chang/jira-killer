import { BurnUpChartData, VelocityChartData } from '../../define/base';
import { IssueStatus } from '../../define/issue-status';
import { JiraSprint } from '../../define/jira-type';
import { registerPluginToChart } from '../../lib/chart-register';
import { getUrlBoardId } from '../../lib/url-utils';
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
  @ViewChild('burnUpChart') burnUpChartEle: ElementRef;
  @ViewChild('velocityChart') velocityChartEle: ElementRef;

  sprint: JiraSprint | null;

  private isCalculating = false;
  private burnUpChart: Chart;
  private velocityChart: Chart;

  get enableCalBurnUpBtn(): boolean {
    return !this.isCalculating && !!this.sprint;
  }

  get enableCalVelocityBtn(): boolean {
    return !this.isCalculating && !!this.boardId;
  }

  get enableSelector(): boolean {
    return !this.isCalculating;
  }

  get boardId(): number | null {
    return getUrlBoardId();
  }

  constructor(private chartService: ChartService) {
    registerPluginToChart();
  }

  ngAfterViewInit(): void {
    this.drawEmptyBurnUpChart();
    this.drawEmptyVelocityChart();
  }

  onClickCalBurnUpChart(): void {
    if (this.sprint && this.sprint.startDate && this.sprint.endDate) {
      this.isCalculating = true;
      this.chartService.getBurnUpChartData(this.sprint).subscribe((data) => {
        this.drawBurnUpChart(data);
        this.isCalculating = false;
      });
    } else {
      console.log("This sprint didn't set startDate or endDate.");
    }
  }

  onClickCalVelocityChart(): void {
    if (this.boardId) {
      this.isCalculating = true;
      this.chartService.getVelocityChartData(this.boardId, 6).subscribe((ret) => {
        this.drawVelocityChart(ret);
        this.isCalculating = false;
      });
    } else {
      console.log('Can not get board id from url.');
    }
  }

  private drawEmptyBurnUpChart(): void {
    const config = {
      type: 'line',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Burn Up Chart',
          },
          annotation: {},
        },
      },
    };
    if (this.burnUpChart) {
      this.burnUpChart.destroy();
    }
    this.burnUpChart = new Chart(this.burnUpChartEle.nativeElement, config as any);
  }

  private drawBurnUpChart(burnUpChartData: BurnUpChartData): void {
    const dayCount = this.chartService.getDayDiff(this.sprint!.startDate as string, this.sprint!.endDate as string) + 1;

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
    if (this.chartService.isDateInSprint(today, this.sprint!)) {
      const dayDeltaOfToday = this.chartService.getDayDiff(this.sprint!.startDate as string, moment());
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

    if (this.burnUpChart) {
      this.burnUpChart.destroy();
    }
    this.burnUpChart = new Chart(this.burnUpChartEle.nativeElement, config as any);
  }

  private drawEmptyVelocityChart(): void {
    const config = {
      type: 'bar',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Velocity Chart',
          },
          annotation: {},
        },
      },
    };
    if (this.velocityChart) {
      this.velocityChart.destroy();
    }
    this.velocityChart = new Chart(this.velocityChartEle.nativeElement, config as any);
  }

  private drawVelocityChart(velocityChartData: VelocityChartData): void {
    const data = {
      labels: velocityChartData.sprintNames,
      datasets: [
        {
          label: 'Total Points',
          data: velocityChartData.velocities,
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgb(75, 192, 192)'],
          borderWidth: 1,
        },
      ],
    };

    const config = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Velocity Chart',
          },
          annotation: {},
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    if (this.velocityChart) {
      this.velocityChart.destroy();
    }
    this.velocityChart = new Chart(this.velocityChartEle.nativeElement, config as any);
  }
}
