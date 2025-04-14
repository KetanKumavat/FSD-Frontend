import { Component, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { OrientationService } from '../../services/orientation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css'],
  imports: [
    CommonModule, // For *ngIf, *ngFor directives
    FormsModule, // For [(ngModel)] binding
    ZXingScannerModule, // For <zxing-scanner> element
  ],
})
export class QrScannerComponent implements OnInit {
  @ViewChild('scanner') scanner!: ZXingScannerComponent;

  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;

  formatsEnabled: any[] = [];
  scannerEnabled = true;

  scanResult: string = '';
  scanSuccess = false;
  scanError = false;
  errorMessage = '';
  isProcessing = false;
  studentEmail = '';

  constructor(private orientationService: OrientationService) {}

  ngOnInit(): void {}

  onDevicesFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    if (devices.length > 0) {
      this.currentDevice = devices[0];
    }
  }

  onScanSuccess(result: string): void {
    this.scanResult = result;
    this.scannerEnabled = false;

    // Process QR data format - expecting "session:1234"
    if (result.startsWith('session:')) {
      const sessionId = parseInt(result.split(':')[1], 10);
      this.handleSessionQrCode(sessionId);
    } else {
      this.scanError = true;
      this.errorMessage = 'Invalid QR code format';
    }
  }

  handleSessionQrCode(sessionId: number): void {
    this.isProcessing = true;
    // Clear previous statuses
    this.scanSuccess = false;
    this.scanError = false;
  }

  onSubmitEmail(): void {
    if (!this.studentEmail) {
      this.scanError = true;
      this.errorMessage = 'Email is required';
      return;
    }

    if (!this.scanResult.startsWith('session:')) {
      this.scanError = true;
      this.errorMessage = 'Invalid QR code';
      return;
    }

    const sessionId = parseInt(this.scanResult.split(':')[1], 10);
    this.isProcessing = true;

    this.orientationService
      .checkInStudent(sessionId, this.studentEmail)
      .subscribe({
        next: () => {
          this.scanSuccess = true;
          this.scanError = false;
          this.isProcessing = false;
          this.studentEmail = '';
        },
        error: (error) => {
          console.error('Error during check-in', error);
          this.scanError = true;
          this.errorMessage =
            error.error?.message || 'Failed to check in student';
          this.isProcessing = false;
        },
      });
  }

  restartScan(): void {
    this.scannerEnabled = true;
    this.scanResult = '';
    this.scanSuccess = false;
    this.scanError = false;
    this.studentEmail = '';
    this.isProcessing = false;
  }
}
