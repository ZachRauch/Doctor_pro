import { Component } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  public username = ''
  public password = ''
  public password2 = ''
  public value = false
  public patient = 'Patient'
  public doctor = 'Doctor'


  constructor(public ui: UiService) {}

  setValueFalse(): void {
    this.value = false
  }

  setValueTrue(): void {
    this.value = true
  }
}
