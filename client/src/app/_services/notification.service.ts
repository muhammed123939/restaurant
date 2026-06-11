import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment.development';

export interface Notification {
  id: number;
  userId: number;
  role: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
private baseUrl = environment.apiUrl + '/notifications';

  // ✅ Store notifications & unread count in BehaviorSubject (reactive state)
  private _notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this._notifications.asObservable();

  private _unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this._unreadCount.asObservable();

  constructor(private http: HttpClient) {}

  /** ✅ Load unread notifications and update state */
loadUnread(userId: number): void {
  this.http.get<Notification[]>(`${this.baseUrl}/unread/${userId}`)
    .subscribe(notifs => {
      // Update state only
      this._notifications.next(notifs);
      this._unreadCount.next(notifs.length);
    });
}


  /** ✅ Load all notifications */
  loadAll(userId: number): void {
    this.http.get<Notification[]>(`${this.baseUrl}/all/${userId}`)
      .subscribe(notifs => {
        this._notifications.next(notifs);
        const unread = notifs.filter(n => !n.isRead).length;
        this._unreadCount.next(unread);
      });
  }

  /** ✅ Mark a single notification as read */
  markAsRead(id: number): void {
    this.http.post<void>(`${this.baseUrl}/mark-read/${id}`, {})
      .pipe(
        tap(() => {
          const updated = this._notifications.value.map(n =>
            n.id === id ? { ...n, isRead: true } : n
          );
          this._notifications.next(updated);
          this._unreadCount.next(updated.filter(n => !n.isRead).length);
        })
      )
      .subscribe();
  }
/** ✅ Mark all as read for a user */
markAllAsRead(userId: number): void {

  this.http
    .post<void>(`${this.baseUrl}/mark-all-read/${userId}`, {})
    .pipe(
      tap(() => {

        const updated = this._notifications.value.map(n => ({
          ...n,
          isRead: true
        }));

        this._notifications.next(updated);
        this._unreadCount.next(0);

      })
    )
    .subscribe({
      error: (err) => {
        console.error('Failed to mark notifications as read', err);
      }
    });

}}
