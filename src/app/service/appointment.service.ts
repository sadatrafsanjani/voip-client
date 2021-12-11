import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AppointmentResponse} from "../dto/response/appointment-response";

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private url =  environment.BASE_API_URL + '/appointments';

  constructor(private http: HttpClient) {

  }

  getAppointments(): Observable<AppointmentResponse[]>{

    return this.http.get<AppointmentResponse[]>(this.url);
  }

  applyForAppointment(id: number): Observable<any>{

    const payload = {
      userId: id
    };

    return this.http.post<AppointmentResponse>(this.url, payload, {observe: 'response'});
  }

  approveAppointment(id: number): Observable<any>{

    return this.http.put(this.url + '/' + id, {observe: 'response'});
  }
}
