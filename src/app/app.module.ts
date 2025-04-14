import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/interceptors/auth.interceptor';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { FormsModule } from '@angular/forms';
import { QrCodeGeneratorComponent } from './admins/components/qr-code-generator/qr-code-generator.component';
import { QrScannerComponent } from './admins/components/qr-scanner/qr-scanner.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    HttpClientModule,
    ZXingScannerModule,
    FormsModule,
    QrCodeGeneratorComponent,
    QrScannerComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
