import { Component, OnInit } from '@angular/core';
import {MeetingService} from "../service/meeting.service";
import {MeetingPayload} from "../dto/payload/meeting-payload";
import {ToastrService} from "ngx-toastr";
import {NgxSpinnerService} from "ngx-spinner";
import {MeetingResponse} from "../dto/response/meeting-response";
import {ConsoleLogger, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration} from 'amazon-chime-sdk-js';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private meetingPayload!: MeetingPayload;
  private callSession: any;
  private audio: any;

  constructor(private meetingService: MeetingService,
              private toastr: ToastrService,
              private spinner: NgxSpinnerService) {
    this.meetingPayload = {
      meetingId: '',
      attendeeName: ''
    };
  }

  ngOnInit(): void {

    this.audio = new Audio();
    this.audio.src = "../../assets/audio/dialer-tone.wav";
    this.audio.load();
  }

  initiateCall(){

    this.spinner.show();
    this.playDialerTone();

    this.meetingPayload.meetingId = "test";
    this.meetingPayload.attendeeName = "doctor";

    this.meetingService.initiateMeeting(this.meetingPayload).subscribe(
      async response => {

        this.spinner.hide();

        if(response.body != null){
          await this.initiateDeviceControls(response.body);
        }
      },
        error => {
          this.spinner.hide();
      }
    );
  }

  private async initiateDeviceControls(response: MeetingResponse) {

    const logger = new ConsoleLogger('Logger', LogLevel.INFO);
    const deviceController = new DefaultDeviceController(logger);

    const meetingResponse = response.JoinInfo.Meeting;
    const attendeeResponse = response.JoinInfo.Attendee;
    const configuration = new MeetingSessionConfiguration(meetingResponse, attendeeResponse);
    const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);

    const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
    const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();
    const videoInputDevices = await meetingSession.audioVideo.listVideoInputDevices();

    const audioInputDeviceInfo = audioInputDevices[0];

    this.callSession = meetingSession.audioVideo;

    await this.callSession.chooseAudioInputDevice(audioInputDeviceInfo.deviceId);

    const audioOutputDeviceInfo = audioOutputDevices[0];
    await this.callSession.chooseAudioOutputDevice(audioOutputDeviceInfo.deviceId);

    const videoInputDeviceInfo = videoInputDevices[0];
    await this.callSession.chooseVideoInputDevice(videoInputDeviceInfo.deviceId);

    const videoElementSelf = document.getElementById('video-preview-self') as HTMLVideoElement;
    const videoElementRemote = document.getElementById('video-preview-remote') as HTMLVideoElement;

    this.callSession.bindVideoElement(0, videoElementSelf);
    this.callSession.startVideoPreviewForVideoInput(videoElementSelf);
    this.callSession.startLocalVideoTile();
    this.callSession.start();

    const observer = {
      videoTileDidUpdate: tileState => {
        if (!tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
          return;
        }

        this.callSession.bindVideoElement(2, videoElementRemote);
        this.toastr.success("Video Call Started!");
        this.stopDialerTone();
      }
    };

    this.callSession.addObserver(observer);
  }

  private openCallModal() {

    $("#callModal").modal('show');
  }

  private closeCallModal() {

    $("#callModal").modal('hide');
  }

  private playDialerTone(){

    this.audio.play();
  }

  private stopDialerTone(){

    this.audio.pause();
  }
}
