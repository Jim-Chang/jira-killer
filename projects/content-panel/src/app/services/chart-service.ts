import { BurnUpChartData, IssueStatus, IssueStatusChangeDate, JiraSprint } from '../lib/define';
import { JiraService } from './jira.service';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { map, Observable } from 'rxjs';

type IssueStatusAware = IssueStatus.InReview | IssueStatus.ReadyForVerification | IssueStatus.Closed;

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  constructor(private jiraService: JiraService) {}

  getBurnUpChartData(sprint: JiraSprint): Observable<BurnUpChartData> {
    return this.jiraService.getIssueStatusChangeDatesBySprint(sprint.id).pipe(
      map((ret) => {
        return this.calculateBurnUpChartData(sprint, ret);
      }),
    );
  }

  getDayDiff(d1: moment.Moment | string, d2: moment.Moment | string): number {
    if (typeof d1 === 'string') {
      d1 = moment(d1);
    }
    if (typeof d2 === 'string') {
      d2 = moment(d2);
    }
    return Math.abs(d1.diff(d2, 'day', false));
  }

  private calculateBurnUpChartData(
    sprint: JiraSprint,
    issueStatusChangeDates: IssueStatusChangeDate[],
  ): BurnUpChartData {
    console.log('issueStatusChangeDates', issueStatusChangeDates);

    const dayDiff = this.getDayDiff(sprint.startDate as string, sprint.endDate as string);
    const chartData = {
      totalPoints: 0,
      [IssueStatus.InReview]: Array(dayDiff + 1).fill(0),
      [IssueStatus.ReadyForVerification]: Array(dayDiff + 1).fill(0),
      [IssueStatus.Closed]: Array(dayDiff + 1).fill(0),
    };

    issueStatusChangeDates
      // only calculate issue which has story point
      .filter((iscd) => !!iscd.storyPoint)
      .forEach((iscd) => {
        const storyPoint = iscd.storyPoint as number;
        chartData.totalPoints += storyPoint;

        Object.entries(iscd.changeDateMap)
          // only calculate status in IssueStatusAware (in review, RFV, closed)
          .filter(([status, date]) =>
            [IssueStatus.InReview, IssueStatus.ReadyForVerification, IssueStatus.Closed].includes(status as any),
          )
          .forEach(([status, date]) => {
            // only calculate change date is in sprint
            if (date && this.isDateInSprint(date, sprint)) {
              const dayDiff = this.getDayDiff(date, sprint.startDate as string);
              chartData[status as IssueStatusAware][dayDiff] += storyPoint as number;
            }
          });
      });

    // aggregate points day by day
    for (let i = 1; i < dayDiff + 1; i++) {
      [IssueStatus.InReview, IssueStatus.ReadyForVerification, IssueStatus.Closed].forEach((status) => {
        chartData[status as IssueStatusAware][i] += chartData[status as IssueStatusAware][i - 1];
      });
    }

    console.log('chart data', chartData);
    return chartData;
  }

  private isDateInSprint(date: moment.Moment, sprint: JiraSprint): boolean {
    const startDate = moment(sprint.startDate as string).set({ hour: 0, minute: 0, second: 0 });
    const endDate = moment(sprint.endDate as string).set({ hour: 23, minute: 59, second: 59 });
    return date >= startDate && date <= endDate;
  }
}
