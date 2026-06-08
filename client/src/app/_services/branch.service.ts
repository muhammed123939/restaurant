import { inject, Injectable } from '@angular/core';
import { Branch } from '../_models/branch';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment.development';
import { Idname } from '../_models/idname';


@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  };

  delete(id: number) {
    return this.http.delete(this.baseUrl + `branch/${id}`);
  }

  getBranchbyid(id: number): Observable<Branch> {
    return this.http.get<Branch>(this.baseUrl + `branch/${id}`, this.httpOptions);
  }

  getall(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.baseUrl + `branch/getall`, this.httpOptions);
  }

  idname(): Observable<Idname[]> {
    return this.http.get<Idname[]>(this.baseUrl + `branch/idname`, this.httpOptions);
  }

  idnameforcategories(): Observable<Idname[]> {
    return this.http.get<Idname[]>(this.baseUrl + `branch/idnameforcategories`, this.httpOptions);
  }

  register(model: any) {
    return this.http.post(this.baseUrl + `branch/register`, model)
  }

  update(member: Branch) {
    return this.http.put(this.baseUrl + 'branch/', member)
  }

}
