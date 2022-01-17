import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {MessagePayload} from "../dto/payload/message-payload";
import {MessageResponse} from "../dto/response/message-response";
import {RoomResponse} from "../dto/response/room-response";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private url =  environment.BASE_API_URL + '/chats';

  constructor(private http: HttpClient) {

  }

  getRoom(): Observable<RoomResponse>{
    return this.http.get<RoomResponse>(this.url + '/room/1');
  }

  listMessages(userArn: String, channelArn: string): Observable<MessageResponse[]>{
    return this.http.get<MessageResponse[]>(this.url + '?userArn=' + userArn + '&channelArn=' + channelArn);
  }

  sendMessage(payload: MessagePayload){

    return this.http.post(this.url + "/sendMessage", payload, {observe: 'response'});
  }
}
