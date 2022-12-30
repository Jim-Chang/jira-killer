import { BurnUpChartData, IssueStatus, IssueStatusChangeLog, JiraSprint } from '../lib/define';
import { JiraService } from './jira.service';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { map, Observable } from 'rxjs';

type IssueStatusAware = IssueStatus.InReview | IssueStatus.ReadyForVerification | IssueStatus.Closed;
const ISSUE_STATUS_AWARE: IssueStatusAware[] = [
  IssueStatus.InReview,
  IssueStatus.ReadyForVerification,
  IssueStatus.Closed,
];
const OFF_DAY = [6, 0]; // in js, sunday = 0

const getDateOfStart = (date: moment.Moment | string) => moment(date).startOf('day');
const getDateOfEnd = (date: moment.Moment | string) => moment(date).endOf('day');

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  constructor(private jiraService: JiraService) {}

  getBurnUpChartData(sprint: JiraSprint): Observable<BurnUpChartData> {
    return this.jiraService.getIssueStatusChangeLogsBySprint(sprint.id).pipe(
      map((ret) => {
        return this.calculateBurnUpChartData(sprint, ret);
      }),
    );
  }

  getDayDiff(d1: moment.Moment | string, d2: moment.Moment | string): number {
    if (!d1 || !d2) {
      throw 'date should be string or moment obj';
    }
    let [_d1, _d2] = [moment(d1), moment(d2)];
    [_d1, _d2] = _d1 < _d2 ? [getDateOfStart(_d1), getDateOfEnd(_d2)] : [getDateOfEnd(_d1), getDateOfStart(_d2)];
    return Math.abs(_d1.diff(_d2, 'day', false));
  }

  isDateInSprint(date: moment.Moment, sprint: JiraSprint): boolean {
    const startDate = getDateOfStart(sprint.startDate as string);
    const endDate = getDateOfEnd(sprint.endDate as string);
    return date >= startDate && date <= endDate;
  }

  private calculateBurnUpChartData(sprint: JiraSprint, issueStatusChangeLogs: IssueStatusChangeLog[]): BurnUpChartData {
    const dayDiff = this.getDayDiff(sprint.startDate as string, sprint.endDate as string);
    const chartData: BurnUpChartData = { totalPoints: 0 } as any;
    ISSUE_STATUS_AWARE.forEach((status) => (chartData[status] = Array(dayDiff + 1).fill(0)));

    issueStatusChangeLogs
      // only calculate issue which has story point
      .filter((log) => !!log.storyPoint)
      .forEach((log) => {
        const storyPoint = log.storyPoint as number;
        chartData.totalPoints += storyPoint;

        Object.entries(log.statusLogMap)
          // only calculate status in IssueStatusAware
          .filter(([status, date]) => ISSUE_STATUS_AWARE.includes(status as any))
          .forEach(([status, date]) => {
            // only calculate change date is in sprint
            if (date && this.isDateInSprint(date, sprint)) {
              const dayDiff = this.getDayDiff(date, sprint.startDate as string);
              chartData[status as IssueStatusAware][dayDiff] += storyPoint;
            }
          });
      });

    chartData.refBurnUpLine = this.genRefBurnDailyPoints(sprint, chartData.totalPoints);

    // aggregate points day by day
    for (let i = 1; i < dayDiff + 1; i++) {
      [...ISSUE_STATUS_AWARE, 'refBurnUpLine'].forEach((status) => {
        chartData[status as IssueStatusAware][i] += chartData[status as IssueStatusAware][i - 1];
      });
    }
    return chartData;
  }

  private genRefBurnDailyPoints(sprint: JiraSprint, totalPoints: number): number[] {
    const startDate = getDateOfStart(sprint.startDate as string);
    const endDate = getDateOfStart(sprint.endDate as string);

    const dayDiff = this.getDayDiff(startDate, endDate);

    const workingDayMask: number[] = [...Array(dayDiff + 1).keys()].map((deltaDay) => {
      // because moment.add() will modify date self, we should clone start date for calculation
      const day = moment(startDate).add(deltaDay, 'days').day();
      return OFF_DAY.includes(day) ? 0 : 1;
    });

    const workingDayCount = workingDayMask.reduce((prev, cur) => prev + cur);
    const avgPointsPerDay = totalPoints / workingDayCount;
    return workingDayMask.map((mask) => mask * avgPointsPerDay);
  }
}
