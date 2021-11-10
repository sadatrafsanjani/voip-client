import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {MeetingPayload} from "../dto/payload/meeting-payload";
import {MeetingResponse} from "../dto/response/meeting-response";

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  private url =  environment.BASE_API_URL + '/meetings';

  constructor(private http: HttpClient) {

  }

  initiateMeeting(payload: MeetingPayload): Observable<any>{

    return this.http.post<MeetingResponse>(this.url + '/call', payload, {observe: 'response'});
  }
}
