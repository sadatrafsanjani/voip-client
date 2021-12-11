import { Component, OnInit } from '@angular/core';
import {ChatService} from "../service/chat.service";
import {AppointmentService} from "../service/appointment.service";
import {ToastrService} from "ngx-toastr";
import {NgxSpinnerService} from "ngx-spinner";
import {AppointmentResponse} from "../dto/response/appointment-response";
import {PatientResponse} from "../dto/response/patient-response";

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {

  appointments: Array<AppointmentResponse>;
  member: PatientResponse;

  constructor(private chatService: ChatService,
              private appointmentService: AppointmentService,
              private toastr: ToastrService,
              private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getAppointments();
  }

  private getAppointments(){

    this.appointmentService.getAppointments().subscribe(response => {
      this.appointments = response;
    });
  }

  createMember(){

    this.spinner.show();

    this.chatService.createMember().subscribe(response => {

      this.member = response.body;
      console.log(response.body);
     this.spinner.hide();
     this.toastr.success('User Created!');
    });
  }

  applyForAppointment(){

    this.appointmentService.applyForAppointment(this.member.id);
  }

  approveAppointment(id: number){

    this.spinner.show();

    this.appointmentService.approveAppointment(id).subscribe(response => {
      this.spinner.hide();
      this.toastr.success('Appointment Approved!');
    });
  }
}
