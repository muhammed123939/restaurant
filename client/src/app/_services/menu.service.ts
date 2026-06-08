import { inject, Injectable } from '@angular/core';
import { Menu } from '../_models/menu';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment.development';
import { Photo } from '../_models/photo';
import { Idname } from '../_models/idname';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  };

  delete(id: number) {
    return this.http.delete(this.baseUrl + `menu/${id}`);
  }

  deletePhoto(menuItemId: number) {
    return this.http.delete(this.baseUrl + `menu/DeletePhoto/${menuItemId}`, this.httpOptions);
  }

  getItembyid(id: number, id2: number): Observable<Menu> {
    return this.http.get<Menu>(this.baseUrl + `menu/${id}/${id2}`, this.httpOptions);
  }

  getMenuByBranch(branchID: number): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + `menu/branch/${branchID}`);
  }

  getPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.baseUrl + `menu/GetMenuPhotos`, this.httpOptions);
  }

  getPhoto(menuItemId: number): Observable<Photo> {
    return this.http.get<Photo>(this.baseUrl + `menu/GetMenuPhoto/${menuItemId}`, this.httpOptions);
  }

  getall(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.baseUrl + `menu/getall`, this.httpOptions);
  }

  idname(): Observable<Idname[]> {
    return this.http.get<Idname[]>(this.baseUrl + `menu/idname`, this.httpOptions);
  }

  register(model: any) {
    return this.http.post(this.baseUrl + `menu/register`, model)
  }

  update(member: Menu) {
    return this.http.put(this.baseUrl + 'menu/', member)
  }

}