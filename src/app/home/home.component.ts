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
import { faPhone, faPhoneSlash, faCamera, faMicrophone, faMicrophoneSlash, faSms, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
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
  faPaperPlane = faPaperPlane;
  callButtonFlag: boolean = true;

  private meetingPayload!: MeetingPayload;
  private callSession: any;
  private dialerAudio: any;
  private ringAudio: any;
  private meetingResponse: MeetingResponse;
  private attendeePresenceSet = new Set();

  constructor(private notificationService: NotificationService,
              private meetingService: MeetingService,
              private toastr: ToastrService,
              private spinner: NgxSpinnerService) {

    this.meetingPayload = {
      attendeeName: 'doctor',
      senderPhoneNo: '01799554639',
      receiverPhoneNo: '01734811761'
    };

    this.meetingResponse = {
      callerNo: '',
      JoinInfo: null
    };
  }

  ngOnInit(): void {

    this.initiateDialerTone();
    this.initiateRingTone();
    this.senseNotification();
  }

  private senseNotification(){

    this.notificationService.requestPermission();
    this.notificationService.receiveMessage();

    this.notificationService.$behaviorSubjectChange.subscribe(async response => {

      if(response){

        const notification = await response.data.action;

        if(notification === "INCOMING_CALL"){

          if(this.meetingResponse.JoinInfo == null){

            this.meetingResponse.JoinInfo = await JSON.parse(response.data.data).JoinInfo;
            this.meetingResponse.callerNo = await response.data.callerNo;
            this.openCallModal();
          }
        }
        else if(notification === "REJECT_CALL"){
          this.rejectedCall();
        }
      }

    });
  }

  startCall(){

    this.callButtonFlag = false;
    this.spinner.show();
    this.playDialerTone();
    this.meetingResponse.callerNo = this.meetingPayload.receiverPhoneNo;

    this.meetingService.initiateCall(this.meetingPayload).subscribe(async response => {

        if(response.body != null){

          //this.autoDisconnectCall();

          await this.initiateDeviceControls(response.body);
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error('Please try again!');
      }
    );
  }

  private autoDisconnectCall(){

    setInterval(()=>{

      if(this.attendeePresenceSet.size < 2){
        this.endCall();
      }

    }, 15000);
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

  private rejectedCall(){

    this.spinner.hide();
    this.stopDialerTone();
    $("#callModal").modal('hide');
    this.callButtonFlag = true;
    this.meetingResponse.JoinInfo = null;
    this.meetingResponse.callerNo = '';
    this.toastr.info("Caller rejected call!");
  }

  public rejectCall(){

    this.meetingService.rejectCall(this.meetingResponse.callerNo).subscribe(() => {

      this.spinner.hide();
      this.stopRingTone();
      $("#callModal").modal('hide');
      this.callButtonFlag = true;
      this.meetingResponse.JoinInfo = null;
      this.meetingResponse.callerNo = '';
      this.toastr.info("You declined call!");
    });
  }

  endCall(){

    this.meetingService.rejectCall(this.meetingResponse.callerNo).subscribe(() => {

      this.stopDialerTone();
      this.spinner.hide();
      this.callButtonFlag = true;
      this.meetingResponse = null;
      this.callSession.stopLocalVideoTile();
      this.toastr.info("Call ended!");
    });
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
