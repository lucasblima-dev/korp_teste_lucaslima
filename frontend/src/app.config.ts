import { ApplicationConfig, importProvidersFrom } from '@angular/core';
//import { provideRouter } from '@angular/router';
//import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
//import { MatSnackBarModule } from '@angular/material/snack-bar';

// import { loadingInterceptor } from './core/interceptors/loading.interceptor';
// import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    //provideRouter(routes),
    //provideAnimationsAsync(),
    provideHttpClient(
      // withInterceptors([loadingInterceptor, errorInterceptor])
    ),
    //importProvidersFrom(MatSnackBarModule)
  ]
};
