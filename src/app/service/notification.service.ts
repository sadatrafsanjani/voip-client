import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFireMessaging} from "@angular/fire/compat/messaging";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private behaviorSubject = new BehaviorSubject(null);
  public $behaviorSubjectChange = this.behaviorSubject.asObservable();

  constructor(private angularFireMessaging: AngularFireMessaging) {
  }

  requestPermission() {

    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        //console.log(token);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }

  receiveMessage() {

    this.angularFireMessaging.messages.subscribe((payload) => {
        //console.log(payload);
        this.behaviorSubject.next(payload);
      });
  }
}
