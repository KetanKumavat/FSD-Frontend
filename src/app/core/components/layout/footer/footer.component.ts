import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,

  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  @Input()
  applicationName: string = 'Event Management';
  currentDate: string = new Date().toLocaleDateString();
}
