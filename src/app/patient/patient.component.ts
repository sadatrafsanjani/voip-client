import { Component, OnInit } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  faPaperPlane = faPaperPlane;

  constructor() { }

  ngOnInit(): void {
  }

  messageListener(){

    const observer = {
      messagingSessionDidStart: () => {
        console.log('Session started');
      },
      messagingSessionDidStartConnecting: reconnecting => {
        if (reconnecting) {
          console.log('Start reconnecting');
        } else {
          console.log('Start connecting');
        }
      },
      messagingSessionDidStop: event => {
        console.log(`Closed: ${event.code} ${event.reason}`);
      },
      messagingSessionDidReceiveMessage: message => {
        console.log(`Receive message type ${message.type}`);
      }
    };

    //messagingSession.addObserver(observer);
    //messagingSession.start();
  }

}
