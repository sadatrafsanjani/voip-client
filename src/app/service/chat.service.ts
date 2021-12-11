import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {PatientResponse} from "../dto/response/patient-response";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private url =  environment.BASE_API_URL + '/chats';

  constructor(private http: HttpClient) {

  }

  createMember(): Observable<any>{

    return this.http.post<PatientResponse>(this.url + "/createMember", null, {observe: 'response'});
  }
}
