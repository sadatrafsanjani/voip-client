import { Component, OnInit } from '@angular/core';
import {MeetingService} from "../service/meeting.service";
import {MeetingPayload} from "../dto/payload/meeting-payload";
import {ToastrService} from "ngx-toastr";
import {NgxSpinnerService} from "ngx-spinner";
import {MeetingResponse} from "../dto/response/meeting-response";

import {
  AudioVideoObserver,
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  MeetingSessionCredentials, VideoTileState
} from 'amazon-chime-sdk-js';
import MeetingSessionURLs from "amazon-chime-sdk-js/build/meetingsession/MeetingSessionURLs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  meetingPayload!: MeetingPayload;

  constructor(private meetingService: MeetingService,
              private toastr: ToastrService,
              private spinner: NgxSpinnerService) {
    this.meetingPayload = {
      meetingId: '',
      attendeeName: ''
    };
  }

  ngOnInit(): void {
  }

  initiateCall(){

    this.spinner.show();

    this.meetingPayload.meetingId = "test";
    this.meetingPayload.attendeeName = "doctor";

    this.meetingService.initiateMeeting(this.meetingPayload).subscribe(
      async response => {

        await this.spinner.hide();

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

    console.log(response);

    const logger = new ConsoleLogger('Logger', LogLevel.INFO);
    const deviceController = new DefaultDeviceController(logger);

    const meetingResponse = response.JoinInfo.Meeting;
    const attendeeResponse = response.JoinInfo.Attendee;
    const configuration = new MeetingSessionConfiguration(meetingResponse, attendeeResponse);
    const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);

    const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
    const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();
    const videoInputDevices = await meetingSession.audioVideo.listVideoInputDevices();

    audioOutputDevices.forEach(mediaDeviceInfo => {
      console.log(`Audio Output Device ID: ${mediaDeviceInfo.deviceId} Microphone: ${mediaDeviceInfo.label}`);
    });

    const audioInputDeviceInfo = audioInputDevices[0];
    await meetingSession.audioVideo.chooseAudioInputDevice(audioInputDeviceInfo.deviceId);

    const audioOutputDeviceInfo = audioOutputDevices[0];
    await meetingSession.audioVideo.chooseAudioOutputDevice(audioOutputDeviceInfo.deviceId);

    const videoInputDeviceInfo = videoInputDevices[0];
    await meetingSession.audioVideo.chooseVideoInputDevice(videoInputDeviceInfo.deviceId);

    const videoElement = document.getElementById('video-preview-self') as HTMLVideoElement;
    meetingSession.audioVideo.bindVideoElement(0, videoElement);
    meetingSession.audioVideo.startVideoPreviewForVideoInput(videoElement);
    meetingSession.audioVideo.startLocalVideoTile();
    meetingSession.audioVideo.start();

    const videoElementRemote = document.getElementById('video-preview-remote') as HTMLVideoElement;

    const observer = {
      videoTileDidUpdate: tileState => {
        if (!tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
          return;
        }

        meetingSession.audioVideo.bindVideoElement(2, videoElementRemote);
      }
    };

    meetingSession.audioVideo.addObserver(observer);
  }
}
