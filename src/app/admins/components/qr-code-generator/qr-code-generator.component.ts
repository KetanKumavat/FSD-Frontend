import { Component, Input, OnInit } from '@angular/core';
import { OrientationService } from '../../services/orientation.service';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-qr-code-generator',
  templateUrl: './qr-code-generator.component.html',
  styleUrls: ['./qr-code-generator.component.css'],
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
})
export class QrCodeGeneratorComponent implements OnInit {
  @Input() sessionId!: number;
  qrData: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private orientationService: OrientationService) {}

  ngOnInit(): void {
    this.generateQrCode();
  }

  generateQrCode(): void {
    if (!this.sessionId) {
      this.errorMessage = 'No session ID provided';
      return;
    }

    this.isLoading = true;
    this.orientationService.getSessionQrCode(this.sessionId).subscribe({
      next: (response) => {
        this.qrData = response.qrData;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating QR code', error);
        this.errorMessage = 'Failed to generate QR code';
        this.isLoading = false;
      },
    });
  }
}
