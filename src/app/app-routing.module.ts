import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {CallComponent} from "./call/call.component";
import {PatientComponent} from "./patient/patient.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'call', component: CallComponent },
  { path: 'patient', component: PatientComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
