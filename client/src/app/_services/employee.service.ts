import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { map, Observable } from 'rxjs';
import { Employee } from '../_models/employee';
import { UserData } from '../_models/user-data';
import { UserLogin } from '../_models/user-login';
import { Idname } from '../_models/idname';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private http = inject(HttpClient);
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  };
  baseurl = environment.apiUrl;
currentEmployee = signal<UserLogin | null>(
  JSON.parse(localStorage.getItem('employeeLoginStorage') || 'null')
);

  delete(id: number) {
    return this.http.delete(this.baseurl + `employee/${id}`);
  }

  getempbyid(id: number): Observable<UserData> {
    return this.http.get<UserData>(this.baseurl + `employee/${id}`, this.httpOptions);
  }

  getempdatabyid(id: number): Observable<Employee> {
    return this.http.get<Employee>(this.baseurl + `employee/data/${id}`, this.httpOptions);
  }

  getallemp(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseurl + `employee/getall`, this.httpOptions);
  }

  getAvailableDrivers(branchID:number): Observable<UserData[]> {
    return this.http.get<UserData[]>(this.baseurl + `employee/getAvailableDrivers/${branchID}`);
  }

  idname(): Observable<Idname[]> {
    return this.http.get<Idname[]>(this.baseurl + `employee/idname`, this.httpOptions);
  }

  login(model: any) {
    return this.http.post<UserLogin>(this.baseurl + 'employee/login', model).pipe(
      map(loggedEmployee => {
        if (loggedEmployee) {
          localStorage.setItem('employeeLoginStorage', JSON.stringify(loggedEmployee));
          this.currentEmployee.set(loggedEmployee);
        }
        return loggedEmployee; // ✅ important to return the object
      })
    );
  }

  messageemployees(offer: string) {
    return this.http.post(this.baseurl + 'employee/message', JSON.stringify(offer), {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }

  register(model: any) {
    return this.http.post<Employee>(this.baseurl + 'employee/register', model)
  }

  search(term: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseurl + `employee/search?term=${term}`);
  }

  setEmployee(setadmin: UserLogin) {
    this.currentEmployee.set(setadmin);
  }

  updatedata(member: Employee) {
    return this.http.put(this.baseurl + 'employee/data', member)
  }

  update(member: UserData) {
    return this.http.put(this.baseurl + 'employee/', member)
  }

  logout() {
    localStorage.removeItem('employeeLoginStorage');
    this.currentEmployee.set(null);
  }
}
