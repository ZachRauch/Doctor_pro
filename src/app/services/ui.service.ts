import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/User';
import { take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LowerCasePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private showRegister = false
  private showLogin = true
  private loading = false
  private userId: number | undefined
  private username: string | undefined
  private doctor = false
  private appointments = []

  constructor(private http: HttpClient,
    private _snackBar: MatSnackBar) { }

  public getShowRegister(): boolean {
    return this.showRegister
  }

  public getShowLogin(): boolean {
    return this.showLogin
  }

  public getLoading(): boolean {
    return this.loading
  }

  public getUsername(): string | undefined {
    return this.username
  }

  public startRegister(): void {
    this.showLogin = false
    this.showRegister = true
  }

  public startLogin(): void {
    this.showLogin = true
    this.showRegister = false
  }

  private showError(message: string): void {
    this._snackBar.open(message, undefined, {duration: 5000})
  }

  private loginSuccess(user: User): void {
    this.showLogin = false
    this.userId = user.id
    this.username = user.username
    this.doctor = user.doctor
  }

  public tryLogin(username: string, password: string) {
    this.http.get<User[]>(`http://localhost:3000/users?username.toLowerCase()=${username.toLowerCase()}&password=${password}`)
    .pipe(take(1))
    .subscribe({
      next: users => {
      if (users.length !== 1) {
        this.showError('Invalid Username and/or Password')
        return
        }

        this.loginSuccess(users[0])
      },
      error: err => {
        this.showError('Oops, something went wrong on the server side')
        }
      }
    )
  }

  public logout(): void {
    this.showLogin = true
    this.loading = false
    this.userId = undefined
    this.username = undefined
    this.doctor = false
    this.appointments = []
    this.showRegister = false
  
  }

}
