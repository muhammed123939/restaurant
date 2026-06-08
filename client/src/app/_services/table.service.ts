import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment.development';
import { Table } from '../_models/table';
@Injectable({
  providedIn: 'root',
})
export class TableService {

  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  };

  getTablesWithStatus(branchID:number): Observable<any> {

    return this.http.get<Table[]>(this.baseUrl + `table/tables-with-status/${branchID}`, this.httpOptions);
  
  }

  // ✅ CREATE table
  register(model: any) {
    return this.http.post(
      this.baseUrl + `table/register`,
      model,
      this.httpOptions
    );
  }

  // ✅ UPDATE table
  update(model: Table) {
    return this.http.put(
      this.baseUrl + `table`,
      model,
      this.httpOptions
    );
  }

  // ✅ DELETE table
  delete(id: number) {
    return this.http.delete(
      this.baseUrl + `table/${id}`,
      this.httpOptions
    );
  }
  

}
