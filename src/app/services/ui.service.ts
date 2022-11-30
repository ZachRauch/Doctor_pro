import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/User';
import { take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LowerCasePipe } from '@angular/common';
import { Appointment } from 'src/Appointment';

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
  private appointments: Appointment[] = []
  private showNewAppointment = false

  constructor(private http: HttpClient,
    private _snackBar: MatSnackBar) { 
      const username = localStorage.getItem('username')
      const password = localStorage.getItem('password')

      if (username != null && password != null) {
        this.tryLogin(username, password)
      }
     }

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

  public getAppointments(): Appointment[] {
    return this.appointments
  }

  public isDoctor(): boolean {
    return this.userId !== undefined && this.doctor
  }

  public isShowNewApp(): boolean {
    return this.showNewAppointment
  }

  public startNewApp(): void {
    this.showNewAppointment = true
  }

  public stopNewApp(): void {
    this.showNewAppointment = false
  }

  public newApp(date: Date, slot: number): void {
    this.showNewAppointment = false
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
    localStorage.setItem('username', user.username)
    localStorage.setItem('password', user.password)
    this.loadAppointments()
  }

  private loadAppointments(): void {
    this.loading = true
    if (this.doctor) {
      this.http.get<Appointment[]>(`http://localhost:3000/appointments?doctorId=${this.userId}`)
      .pipe(take(1))
      .subscribe({
        next: appointments => {
          console.log(appointments)
          this.appointments = appointments
          this.loading = false},
        error: () => this.showError('Oops, something went wrong')
      })
    } else {
      this.showError(`Patient appointments haven't been implemented yet`)
      this.loading = false
    }
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
    this.showNewAppointment = false
    localStorage.clear()
  }

}
