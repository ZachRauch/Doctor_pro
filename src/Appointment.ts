export class Appointment {
    constructor(
    public id: number,
    public doctorId: number,
    public patientId: number | null,
    public date: Date,
    public slot: number ) {}
    }