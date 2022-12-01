import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookedApptComponent } from './booked-appt.component';

describe('BookedApptComponent', () => {
  let component: BookedApptComponent;
  let fixture: ComponentFixture<BookedApptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookedApptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookedApptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
