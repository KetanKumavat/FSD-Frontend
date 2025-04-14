import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { LandingComponent } from './components/layout/landing/landing.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [FooterComponent, LandingComponent],
  imports: [CommonModule, RouterModule, HeaderComponent],
  exports: [HeaderComponent, FooterComponent, LandingComponent],
})
export class CoreModule {}
