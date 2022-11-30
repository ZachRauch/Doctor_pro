export class Appointment {
    constructor(
    public doctorId: number,
    public patientId: number | null,
    public date: Date,
    public slot: number ) {}
    }