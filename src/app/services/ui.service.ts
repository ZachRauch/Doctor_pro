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
  private bookedAppts: Appointment[] = []
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

  // BUG here, doesn't stop people from booking the same appointment slot
  public newApp(date: Date, slot: number): void {
    slot--

    if (slot < 0 || slot > 8 || slot % 1 !== 0) { 
      this.showError('Slot is invalid')
      return
    }
    if (date < new Date()) {
      this.showError('Date is invalid.')
      return
    }


    if (this.userId === undefined) {
      this.showError('BUG! You are not logged in.')
      return
    }

    else {
      this.http.post('http://localhost:8080/appointments', {
      doctorId: this.userId, 
      patientId: null, 
      date, 
      slot}
    ).pipe(take(1))
    .subscribe({
      next: () => {
        this.loadAppointments()
      },
      error: () => {
          this.showError('Oops, something went wrong on the server side')
        }
    })
      this.showNewAppointment = false
      return
  }
  }

  public deleteAppt(id: number) {
    this.http.delete(`http://localhost:8080/appointments/${id}`)
    .pipe(take(1))
    .subscribe({
      next: () => {
        this.loadAppointments()
      },
      error: () => {
        this.showError('Oops, something went wrong on the server side')
      }
    })
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
    this._snackBar.open(message, undefined, {duration: 10000})
  }

  private loginSuccess(user: User): void {
    this.showLogin = false
    this.showRegister = false
    this.userId = user.id
    this.username = user.username
    this.doctor = user.doctor
    localStorage.setItem('username', user.username)
    localStorage.setItem('password', user.password)
    this.loadAppointments()
  }

  private loadDoctorAppts(): void {
    this.http.get<Appointment[]>(`http://localhost:8080/appointments?doctorId=${this.userId}`)
      .pipe(take(1))
      .subscribe({
        next: appointments => {
          this.appointments = appointments
          this.loading = false},
        error: () => {
          this.loading = false
          this.showError('Oops, something went wrong')
        }
      })
  }

  private loadPatientBookedAppts(): void {
    this.http.get<Appointment[]>(`http://localhost:8080/appointments?patientId=${this.userId}`)
      .pipe(take(1))
      .subscribe({
        next: appointments => {
          this.bookedAppts = appointments
          this.loadAvailableAppts()
          },
        error: () => {
          this.loading = false
          this.showError('Oops, something went wrong')
        }
      })
  }

  private loadAvailableAppts(): void {
    this.http.get<Appointment[]>('http://localhost:8080/appointments')
      .pipe(take(1))
      .subscribe({
        next: appointments => {
          this.appointments = appointments.filter(appt => appt.patientId === null)
          this.loading = false},
        error: () => {
          this.loading = false
          this.showError('Oops, something went wrong')
        }
      })
  }

  private loadAppointments(): void {
    this.loading = true
    if (this.doctor) {
      this.loadDoctorAppts()
    } else {
      this.loadPatientBookedAppts()
    }
  }

  public tryLogin(username: string, password: string) {
    this.http.get<User[]>(`http://localhost:8080/users?username=${username}&password=${password}`)
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

  getPatientBookedAppts(): Appointment[] {
    return this.bookedAppts
  }

  public bookAppt(appointment: Appointment): void {
    this.http.put(`http://localhost:8080/appointments/${appointment.id}`, {
      ...appointment,
      patientId: this.userId
    })
    .pipe(take(1))
    .subscribe({
      next: () => {
        this.loadAppointments()
      },
      error: () => {
        this.showError('Failed to book')
      }
    })

  }

  public cancelAppt(appointment: Appointment): void {
    this.http.put(`http://localhost:8080/appointments/${appointment.id}`, {
      ...appointment,
      patientId: null
    })
    .pipe(take(1))
    .subscribe({
      next: () => {
        this.loadAppointments()
      },
      error: () => {
        this.showError('Failed to cancel')
      }
    })
  }
  public checkPassword(password: string, password2: string): void {

  }

  public tryRegister(username: string, password: string, password2: string, value: boolean): void {
    if (password === password2) {this.http.get<User[]>(`http://localhost:8080/users?username=${username}`)
    .pipe(take(1))
    .subscribe({
      next: users => {
        if (users.length > 0) {
          this.showError('Username is unavailable')
          return
        }

        this.register(username, password, value)
      },
      error: () => {
        this.showError('Failed to register')
      }
    })} else {
      this.showError(`Passwords don't match`)
    }
  }

  public register(username: string, password: string, value: boolean) {
    console.log(value)
    this.http.post(`http://localhost:8080/users`, {
      id: null,
      username,
      password,
      doctor: value
    })
    .pipe(take(1))
    .subscribe({
      next: () => {
        this.tryLogin(username, password)
      },
      error: () => {
        this.showError('Failed to register')
      }
    })
  }

}
