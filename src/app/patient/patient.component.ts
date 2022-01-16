import { Component, OnInit } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MessagePayload} from "../dto/payload/message-payload";
import {ChatService} from "../service/chat.service";


@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  faPaperPlane = faPaperPlane;
  channelArn = "arn:aws:chime:us-east-1:252894276123:app-instance/2d40b42c-3b41-41d0-b409-ea94f01a6982/channel/810d94bfae99a0d100f0e39316af0bc298c3fc5abfea24f8e982468cf72c4a72";
  //userArn = "arn:aws:chime:us-east-1:252894276123:app-instance/2d40b42c-3b41-41d0-b409-ea94f01a6982/user/Doctor-101";
  userArn = 'arn:aws:chime:us-east-1:252894276123:app-instance/2d40b42c-3b41-41d0-b409-ea94f01a6982/user/Patient-e815e518-50ae-460c-96aa-3f16a36deeec';
  chatForm: FormGroup;
  private messagePayload!: MessagePayload;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chatForm = new FormGroup({
      message: new FormControl('', [Validators.required, Validators.minLength(3)])
    });

    this.messagePayload = {
      channelArn: this.channelArn,
      userArn: this.userArn,
      clientRequestToken: 'CLIENT-REQUEST-TOKEN-6f88fe4b-8b9a-4865-afdd-3023362f2f24',
      content: ''
    };
  }

  get message() {

    return this.chatForm.get('message');
  }

  sendMessage(){

    this.messagePayload.content = this.message.value;

    this.chatService.sendMessage(this.messagePayload).subscribe(response => {
      console.log(response);
    });

    this.chatForm.patchValue({message: ''});
  }


}
