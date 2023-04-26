import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { WebReqInterceptorService } from "./web-req-interceptor";
import { SingupPageComponent } from './pages/singup-page/singup-page.component';
import { EditListComponent } from './pages/edit-list/edit-list.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskViewComponent,
    NewListComponent,
    NewTaskComponent,
    LoginPageComponent,
    SingupPageComponent,
    EditListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: WebReqInterceptorService, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
