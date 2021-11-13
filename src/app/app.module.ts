import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {environment} from "../environments/environment";
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import {NgxSpinnerModule} from "ngx-spinner";
import {ToastrModule} from "ngx-toastr";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from "@angular/common/http";
import { CallComponent } from './call/call.component';
import {AngularFireDatabaseModule} from "@angular/fire/compat/database";
import {AngularFireMessagingModule} from "@angular/fire/compat/messaging";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";
import {AngularFireModule} from "@angular/fire/compat";
import {AsyncPipe} from "@angular/common";
import {NotificationService} from "./service/notification.service";
import {MeetingService} from "./service/meeting.service";


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CallComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    NgxSpinnerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        preventDuplicates: true
      }
    ),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
