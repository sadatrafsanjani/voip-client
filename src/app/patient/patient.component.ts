import { Component, OnInit } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MessagePayload} from "../dto/payload/message-payload";
import {ChatService} from "../service/chat.service";
import {MessageResponse} from "../dto/response/message-response";
import {RoomResponse} from "../dto/response/room-response";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  faPaperPlane = faPaperPlane;
  userArn!:string;
  chatForm: FormGroup;
  private messagePayload!: MessagePayload;
  messages: Array<MessageResponse> = [];

  room: RoomResponse;

  constructor(private chatService: ChatService,
              private toastr: ToastrService) { }

  ngOnInit(): void {

    this.getRoom();

    this.chatForm = new FormGroup({
      message: new FormControl('', [Validators.required, Validators.minLength(3)])
    });

    this.messagePayload = {
      channelArn: '',
      userArn: '',
      content: ''
    };

  }

  get message() {

    return this.chatForm.get('message');
  }

  sendMessage(){

    this.messagePayload.channelArn = this.room.channelArn;
    this.messagePayload.userArn = this.userArn;
    this.messagePayload.content = this.message.value;

    this.chatService.sendMessage(this.messagePayload).subscribe(response => {
      console.log(response);
    });
    this.chatForm.patchValue({message: ''});
  }

  listMessage(){
    this.chatService.listMessages(this.userArn, this.room.channelArn).subscribe(response => {
      document.getElementById("#chatContent").innerHTML = "<li>"+ response+"</li>";
    });
  }

  private getRoom(){
    this.chatService.getRoom().subscribe(response => {
      this.room = response;
    });
  }

  doctor(){
    this.userArn = this.room.doctorArn;
    this.toastr.info("Doctor");
  }

  patient(){
    this.userArn = this.room.patientArn;
    this.toastr.info("Patient");
  }
}
