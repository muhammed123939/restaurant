import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { map, Observable, throwError } from 'rxjs';
import { UserData } from '../_models/user-data';
import { UserLogin } from '../_models/user-login';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private http = inject(HttpClient);
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  };
  baseurl = environment.apiUrl;

  currentClient = signal<UserLogin | null>(
    JSON.parse(localStorage.getItem('clientLoginStorage') || 'null')
  );

  delete(id: number) {
    return this.http.delete(this.baseurl + `client/${id}`);
  }

  getClientAddressId(userId: number): Observable<number> {
    if (!userId) {
      return throwError(() => new Error('User ID is required'));
    }
    return this.http.get<number>(this.baseurl + `client/getclientaddressid/${userId}`);
  }

  getclientaddress(id: number): Observable<any[]> {
    return this.http.get<any[]>(this.baseurl + `client/getaddress/${id}`);
  }

  getuserbyid(id: number): Observable<UserData> {
    return this.http.get<UserData>(this.baseurl + `client/${id}`, this.httpOptions);
  }

  getallclients(): Observable<UserData[]> {
    return this.http.get<UserData[]>(this.baseurl + 'client/getAllClients', this.httpOptions);
  }

  getallclientsByBranch(branchID: number): Observable<UserData[]> {
    return this.http.get<UserData[]>(this.baseurl + `client/getclientsByBranch/${branchID}`, this.httpOptions);
  }

  getAddressStatus(userId: number): Observable<boolean> {
    return this.http.get<any[]>(`${this.baseurl}client/getaddress/${userId}`)
      .pipe(
        map(addresses => Array.isArray(addresses) && addresses.length > 0)
      );
  }

  login(model: any) {
    return this.http.post<UserLogin>(this.baseurl + 'client/login', model).pipe(
      map(loggedclient => {
        if (loggedclient) {
          localStorage.setItem('clientLoginStorage', JSON.stringify(loggedclient));
          this.currentClient.set(loggedclient);
        }
        return loggedclient; // ✅ important to return the object
      })
    );
  }

  logout() {
    localStorage.removeItem('clientLoginStorage');
    this.currentClient.set(null);
  }

  offer(offer: string) {
    return this.http.post(this.baseurl + 'client/offer', JSON.stringify(offer), {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }

  register(model: any) {
    return this.http.post<UserLogin>(this.baseurl + 'client/register', model)
  }

  saveAddress(userId: number | undefined, address: any): Observable<boolean> {
    if (!userId) {
      return throwError(() => new Error('User ID is required'));
    }

    return this.http.post<boolean>(
      `${this.baseurl}client/saveAddress/${userId}`,
      address,
      this.httpOptions
    );
  }

  search(term: string): Observable<UserData[]> {
    return this.http.get<UserData[]>(this.baseurl + `client/search?term=${term}`);
  }

  setclient(setclient: UserLogin) {
    this.currentClient.set(setclient);
  }

  update(member: UserData) {
    return this.http.put(this.baseurl + 'client/', member)
  }

  updateAddress(userID: number, address: any): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseurl}client/updateAddress/${userID}`, address, this.httpOptions);
  }

}
