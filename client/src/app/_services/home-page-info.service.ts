import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment.development';
import { Observable } from 'rxjs';
import { HomePageInfo } from '../_models/home-page-info';

@Injectable({
  providedIn: 'root',
})
export class HomePageInfoService {
    private http = inject(HttpClient);
    httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
    };
    baseurl = environment.apiUrl;
  
getHomeInfo(): Observable<HomePageInfo> {
  return this.http.get<HomePageInfo>(this.baseurl + 'homeinfo');
}

  updateHomeInfo(model: HomePageInfo): Observable<HomePageInfo> {
    return this.http.put<HomePageInfo>(this.baseurl + 'homeinfo', model);
  }  
}
