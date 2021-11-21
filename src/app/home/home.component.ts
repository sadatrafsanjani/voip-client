import { Component, OnInit } from '@angular/core';
import {MeetingService} from "../service/meeting.service";
import {MeetingPayload} from "../dto/payload/meeting-payload";
import {ToastrService} from "ngx-toastr";
import {NgxSpinnerService} from "ngx-spinner";
import {MeetingResponse} from "../dto/response/meeting-response";
import {MeetingSessionStatusCode, ConsoleLogger, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration} from 'amazon-chime-sdk-js';
import {environment} from "../../environments/environment";
import {Howl} from 'howler';
import {NotificationService} from "../service/notification.service";
import { faPhone, faPhoneSlash, faCamera, faMicrophone, faMicrophoneSlash, faSms } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  faCamera = faCamera;
  faMicrophone = faMicrophone;
  faPhone = faPhone;
  faPhoneSlash = faPhoneSlash;
  faMicrophoneSlash = faMicrophoneSlash;
  faSms = faSms;

  private meetingPayload!: MeetingPayload;
  private callSession: any;
  private dialerAudio: any;
  private ringAudio: any;
  private meetingResponse: MeetingResponse;

  attendeePresenceSet = new Set();

  constructor(private notificationService: NotificationService,
              private meetingService: MeetingService,
              private toastr: ToastrService,
              private spinner: NgxSpinnerService) {

    this.meetingPayload = {
      attendeeName: 'doctor',
      phoneNo: '01734811761'
    };

    this.meetingResponse = {
      JoinInfo: null
    };
  }

  ngOnInit(): void {

    this.initiateDialerTone();
    this.initiateRingTone();
    this.senseCallNotification();
  }

  private senseCallNotification(){

    this.notificationService.requestPermission();
    this.notificationService.receiveMessage();

    this.notificationService.$behaviorSubjectChange.subscribe(response => {

      if(response){

        this.meetingResponse.JoinInfo = JSON.parse(response.data.data).JoinInfo;
        this.openCallModal();
      }

    });
  }

  startCall(){

    this.spinner.show();
    this.playDialerTone();

    this.meetingService.initiateMeeting(this.meetingPayload).subscribe(
      async response => {

        if(response.body != null){

          setInterval(()=>{

            if(this.attendeePresenceSet.size < 2){
              this.endCall();
            }

          }, 10000);

          await this.initiateDeviceControls(response.body);
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error('Please try again!');
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
        this.stopDialerTone();
        this.spinner.hide();
        this.toastr.success("Video Call Started!");
      },

      audioVideoDidStop: sessionStatus => {

        const sessionStatusCode = sessionStatus.statusCode();

        if (sessionStatusCode === MeetingSessionStatusCode.MeetingEnded) {

          this.toastr.info("Call ended!");
        } else {
          console.log('Stopped with a session status code: ', sessionStatusCode);
        }
      }
    };

    this.callSession.addObserver(observer);

    const callback = (presentAttendeeId, present) => {
      if (present) {
        this.attendeePresenceSet.add(presentAttendeeId);
      } else {
        this.attendeePresenceSet.delete(presentAttendeeId);
        this.endCall();
      }
    };

    this.callSession.realtimeSubscribeToAttendeeIdPresence(callback);
  }

  private initiateDialerTone(){

    this.dialerAudio = new Howl({
      src: [environment.DIALER_TONE_PATH],
      autoplay: false,
      loop: true,
      volume: 0.5
    });
  }

  private initiateRingTone(){

    this.ringAudio = new Howl({
      src: [environment.RING_TONE_PATH],
      autoplay: false,
      loop: true,
      volume: 0.5
    });
  }

  private playDialerTone(){

    this.dialerAudio.play();
  }

  private stopDialerTone(){

    this.dialerAudio.stop();
  }

  private playRingTone(){

    this.ringAudio.play();
  }

  public stopRingTone(){

    this.ringAudio.stop();
  }

  private openCallModal() {

    this.playRingTone();
    $("#callModal").modal('show');
  }

  public acceptCall(){

    this.stopRingTone();
    $("#callModal").modal('hide');

    if(this.meetingResponse){

      this.initiateDeviceControls(this.meetingResponse).then();
    }
  }

  public rejectCall(){

    this.stopRingTone();
    $("#callModal").modal('hide');
    this.meetingResponse = null;
  }

  openCallingWindow() {
    window.open('/call', '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
  }

  endCall(){

    if(this.callSession){

      this.callSession.stop();
      this.toastr.info("Call ended!");
      this.stopDialerTone();
      this.spinner.hide();
    }
  }

  controlAudioDevice(){

    if(this.callSession){

      const state = this.callSession.realtimeIsLocalAudioMuted();

      if (!state) {
        this.callSession.realtimeMuteLocalAudio();
        this.toastr.info("Audio muted!");
      } else {
        this.callSession.realtimeUnmuteLocalAudio();
        this.toastr.info("Audio unmuted!");
      }
    }
  }

  getAudioDeviceState(){

    if(this.callSession){

      return this.callSession.realtimeIsLocalAudioMuted();
    }
  }

  stopVideo(){

    if(this.callSession){

      this.callSession.stopLocalVideoTile();
    }
  }
}
