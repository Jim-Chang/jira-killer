import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardGSheetService {
  private url$: Observable<string>;
  private cacheMap: { [sprintId: string]: Observable<{ [id: string]: number }> } = {};

  constructor(private configService: ConfigService, private http: HttpClient) {
    this.url$ = this.configService.loadByKeys<{ dashboardGSheetUrl: string }>(['dashboardGSheetUrl']).pipe(
      map((cfg) => cfg.dashboardGSheetUrl ?? ''),
      shareReplay(1),
    );
  }

  isSetGSheetUrl(): Observable<boolean> {
    return this.url$.pipe(map((url) => !!url));
  }

  getUserPlanPointsMapBySprint(sprintId: number): Observable<{ [id: string]: number }> {
    if (!(sprintId in this.cacheMap)) {
      const postData = { func_name: 'get_user_plan_points_by_sprint', params: { sprint_id: sprintId } };
      this.cacheMap[sprintId] = this.url$.pipe(
        switchMap((url) => this.http.post<{ [id: string]: number }>(`${url}/query`, postData)),
        shareReplay(1),
      );
    }
    return this.cacheMap[sprintId];
  }
}
