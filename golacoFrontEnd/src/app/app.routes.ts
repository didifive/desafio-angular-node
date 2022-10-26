import { Component } from "@angular/core";
import { Routes } from "@angular/router";
import { AboutComponent } from "./institutional/about/about.component";
import { ContactComponent } from "./institutional/contact/contact.component";
import { HomeComponent } from "./navigation/home/home.component";

export const rootRouterConfig: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component:HomeComponent},
  {path: 'contact', component:ContactComponent},
  {path: 'about', component: AboutComponent}
];
