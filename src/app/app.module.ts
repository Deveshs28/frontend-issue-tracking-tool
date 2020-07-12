import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { IssueDetailComponent } from './issue-detail/issue-detail.component';
import { IssueListComponent } from './issue-list/issue-list.component';
import { IssueCreateComponent } from './issue-create/issue-create.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { IssueEditComponent } from './issue-edit/issue-edit.component';
import { LoadingBarComponent } from './loading-bar/loading-bar.component';
import { IssueApiService } from './issue-api.service';
import { CookieService } from 'ngx-cookie-service';
import { SocketService } from './socket.service';
import { IssueRouteGuardService } from './issue-route-guard.service';
import { RouterModule } from '@angular/router';
import { AllIssuesComponent } from './all-issues/all-issues.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SearchIssueComponent } from './search-issue/search-issue.component';
import { NgpSortModule } from 'ngp-sort-pipe';
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
} from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ServerErrorComponent,
    NotFoundComponent,
    IssueDetailComponent,
    IssueListComponent,
    IssueCreateComponent,
    UserProfileComponent,
    UpdatePasswordComponent,
    IssueEditComponent,
    LoadingBarComponent,
    AllIssuesComponent,
    SearchIssueComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AngularEditorModule,
    NgpSortModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      preventDuplicates: true,
    }),
    SocialLoginModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'registration', component: SignupComponent },
      {
        path: 'home',
        canActivate: [IssueRouteGuardService],
        component: IssueListComponent,
      },
      {
        path: 'viewAll',
        canActivate: [IssueRouteGuardService],
        component: AllIssuesComponent,
      },
      {
        path: 'search',
        canActivate: [IssueRouteGuardService],
        component: SearchIssueComponent,
      },
      {
        path: 'create',
        canActivate: [IssueRouteGuardService],
        component: IssueCreateComponent,
      },
      {
        path: 'detail/:issueId',
        canActivate: [IssueRouteGuardService],
        component: IssueDetailComponent,
      },
      {
        path: 'edit/:issueId',
        canActivate: [IssueRouteGuardService],
        component: IssueEditComponent,
      },
      {
        path: 'profile',
        canActivate: [IssueRouteGuardService],
        component: UserProfileComponent,
      },
      {
        path: 'updatePassword/:userId',
        component: UpdatePasswordComponent,
      },
      {
        path: 'serverError/:errorCode/:message',
        component: ServerErrorComponent,
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ]),
  ],
  providers: [
    IssueApiService,
    CookieService,
    SocketService,
    IssueRouteGuardService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '755083701511-u14g73282rvd9jpuanvedmo2gf1ngfac.apps.googleusercontent.com',
              {
                scope: 'profile email',
              }
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
