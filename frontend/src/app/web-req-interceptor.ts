import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, empty, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, switchMap, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptorService implements HttpInterceptor{

  constructor(private authService: AuthService) { }

  refreshingAccessToken: boolean;

  accessTokenRefreshed: Subject<any> = new Subject();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Handle the request
    request = this.addAuthHeader(request);

    //call next() and handle the response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);

        if (error.status === 401) {
          // 401 error so we are unauthorized

          // refresh the access token
          return this.refreshAccessToken()
            .pipe(
              switchMap(() => {
                request = this.addAuthHeader(request);
                return next.handle(request);
              }),
              catchError((err: any) => {
                console.log(err);
                this.authService .logout();
                return empty();
              })
            )

        } 

        return throwError(error);
      })
    )
  }

  refreshAccessToken() {
    if (this.refreshingAccessToken) {
      return new Observable(observer => {
        this.accessTokenRefreshed.subscribe(() => {
          // bu code access token yenilendiğinde çalışacak
          observer.next();
          observer.complete();
        })
      })
    } else {
      this.refreshingAccessToken = true;
      // access token yenileme isteği göndermek için auth servicesinde bir methodu çağırmak istiyoruz.
      return this.authService.getNewAccessToken().pipe(
        tap(() => {
          console.log("Access Token Refreshed");
          this.refreshingAccessToken = false;
          this.accessTokenRefreshed.next;
        })
      )
    }
    
  }

  addAuthHeader(request: HttpRequest<any>) {
    // get the access token
    const token = this.authService.getAccessToken();

    if (token) {
      // access tokenı istek başlığına ekle; request header
      return request.clone({
        setHeaders: {
          'x-access-token': token
        }
      })
    }
    return request;
  }
}
