import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {MessagePayload} from "../dto/payload/message-payload";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private url =  environment.BASE_API_URL + '/chats';

  constructor(private http: HttpClient) {

  }

  sendMessage(payload: MessagePayload): Observable<any>{

    return this.http.post(this.url + "/sendMessage", payload, {observe: 'response'});
  }
}
