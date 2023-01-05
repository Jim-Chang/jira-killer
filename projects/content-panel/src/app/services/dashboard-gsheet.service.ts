import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardGSheetService {
  private baseUrl: string;
  private cacheMap: { [sprintId: string]: Observable<{ [id: string]: number }> } = {};

  constructor(private configService: ConfigService, private http: HttpClient) {
    this.configService
      .loadByKeys<{ dashboardGSheetUrl: string }>(['dashboardGSheetUrl'])
      .subscribe((cfg) => (this.baseUrl = cfg.dashboardGSheetUrl ?? ''));
  }

  isSetGSheetUrl(): boolean {
    return !!this.baseUrl;
  }

  getUserPlanPointsMapBySprint(sprintId: number, useCache = true): Observable<{ [id: string]: number }> {
    if (!this.baseUrl) {
      console.log('Please set `dashboardGSheetUrl` first to use `DashboardGSheetService`');
      return of({});
    }
    if (!(sprintId in this.cacheMap) || !useCache) {
      const postData = { func_name: 'get_user_plan_points_by_sprint', params: { sprint_id: sprintId } };
      this.cacheMap[sprintId] = this.http
        .post<{ [id: string]: number }>(`${this.baseUrl}/query`, postData)
        .pipe(shareReplay(1));
    }
    return this.cacheMap[sprintId];
  }
}
