import { Component, Input } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Appointment } from 'src/Appointment';

@Component({
  selector: 'app-booked-appt',
  templateUrl: './booked-appt.component.html',
  styleUrls: ['./booked-appt.component.css']
})
export class BookedApptComponent {
  @Input() appointment: Appointment | undefined
  constructor(public ui: UiService) {}
}
