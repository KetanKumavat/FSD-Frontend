import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { OrientationService } from '../services/orientation.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    RouterModule,
  ],
})
export class ReportsComponent implements OnInit, AfterViewInit {
  // Chart references
  @ViewChild('departmentSessionsChart') departmentSessionsChart!: ElementRef;
  @ViewChild('attendanceRateChart') attendanceRateChart!: ElementRef;
  @ViewChild('registrationTrendChart') registrationTrendChart!: ElementRef;
  @ViewChild('departmentDistributionChart')
  departmentDistributionChart!: ElementRef;

  loading = true;
  departments: any[] = [];
  sessions: any[] = [];
  attendanceData: any[] = [];
  stats: any = {};

  // Display columns for sessions table
  displayedColumns: string[] = [
    'department',
    'title',
    'date',
    'registered',
    'attended',
    'rate',
  ];

  // Selected filters
  selectedDepartment: number | null = null;
  dateRange: string = 'all'; // all, week, month, custom

  // Chart instances
  departmentSessionsChartInstance: any;
  attendanceRateChartInstance: any;
  registrationTrendChartInstance: any;
  departmentDistributionChartInstance: any;

  constructor(private orientationService: OrientationService) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadSessions();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
    setTimeout(() => this.initializeCharts(), 500);
  }

  loadDepartments(): void {
    this.orientationService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => console.error('Error loading departments', error),
    });
  }

  loadSessions(): void {
    this.orientationService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.processSessionsData();
        this.loading = false;

        // Initialize charts after data is loaded
        setTimeout(() => this.initializeCharts(), 100);
      },
      error: (error) => {
        console.error('Error loading sessions', error);
        this.loading = false;
      },
    });
  }

  loadStats(): void {
    this.orientationService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => console.error('Error loading stats', error),
    });
  }

  processSessionsData(): void {
    // Create aggregated data for department sessions
    const departmentSessions = this.groupSessionsByDepartment();

    // Process attendance data
    this.attendanceData = this.sessions.map((session) => {
      const attendees = session.attendees || [];
      const capacity = session.capacity || 30;
      const registeredCount = attendees.length;
      const attendedCount = attendees.filter((a: any) => a.checkInTime).length;

      return {
        id: session.orientationID,
        title: session.title || `Session ${session.orientationID}`,
        department: session.department?.departmentName || 'Unassigned',
        departmentId: session.department?.departmentID,
        date: session.time || 'N/A',
        registered: registeredCount,
        attended: attendedCount,
        capacity: capacity,
        rate:
          registeredCount > 0
            ? ((attendedCount / registeredCount) * 100).toFixed(1)
            : '0.0',
      };
    });
  }

  groupSessionsByDepartment(): any[] {
    const departmentMap = new Map();

    this.sessions.forEach((session) => {
      const deptName = session.department?.departmentName || 'Unassigned';
      const deptId = session.department?.departmentID || 0;

      if (!departmentMap.has(deptId)) {
        departmentMap.set(deptId, {
          id: deptId,
          name: deptName,
          sessions: 0,
          registeredStudents: 0,
          attendedStudents: 0,
          capacity: 0,
        });
      }

      const deptData = departmentMap.get(deptId);
      deptData.sessions++;
      deptData.registeredStudents += session.attendees?.length || 0;
      deptData.attendedStudents +=
        session.attendees?.filter((a: any) => a.checkInTime)?.length || 0;
      deptData.capacity += session.capacity || 30;
    });

    return Array.from(departmentMap.values());
  }

  initializeCharts(): void {
    if (
      !this.departmentSessionsChart ||
      !this.attendanceRateChart ||
      !this.registrationTrendChart ||
      !this.departmentDistributionChart
    ) {
      return;
    }

    this.createDepartmentSessionsChart();
    this.createAttendanceRateChart();
    this.createRegistrationTrendChart();
    this.createDepartmentDistributionChart();
  }

  createDepartmentSessionsChart(): void {
    const departmentData = this.groupSessionsByDepartment();

    // Destroy existing chart if it exists
    if (this.departmentSessionsChartInstance) {
      this.departmentSessionsChartInstance.destroy();
    }

    const ctx = this.departmentSessionsChart.nativeElement.getContext('2d');
    this.departmentSessionsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: departmentData.map((d) => d.name),
        datasets: [
          {
            label: 'Sessions',
            data: departmentData.map((d) => d.sessions),
            backgroundColor: '#ff6f00',
            borderColor: '#ff6f00',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Number of Sessions by Department',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  createAttendanceRateChart(): void {
    const departmentData = this.groupSessionsByDepartment();

    // Destroy existing chart if it exists
    if (this.attendanceRateChartInstance) {
      this.attendanceRateChartInstance.destroy();
    }

    const ctx = this.attendanceRateChart.nativeElement.getContext('2d');
    this.attendanceRateChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: departmentData.map((d) => d.name),
        datasets: [
          {
            label: 'Registered',
            data: departmentData.map((d) => d.registeredStudents),
            backgroundColor: '#ff9800',
            stack: 'Stack 0',
          },
          {
            label: 'Attended',
            data: departmentData.map((d) => d.attendedStudents),
            backgroundColor: '#ff6f00',
            stack: 'Stack 1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Registration vs Attendance by Department',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Students',
            },
          },
        },
      },
    });
  }

  createRegistrationTrendChart(): void {
    // Create data for registration trend over time
    // We'll simulate some data since we don't have actual trend data
    const dates = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    const registrationData = [15, 30, 40, 50, 45];
    const attendanceData = [12, 25, 35, 48, 40];

    // Destroy existing chart if it exists
    if (this.registrationTrendChartInstance) {
      this.registrationTrendChartInstance.destroy();
    }

    const ctx = this.registrationTrendChart.nativeElement.getContext('2d');
    this.registrationTrendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Registrations',
            data: registrationData,
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Attendance',
            data: attendanceData,
            borderColor: '#ff6f00',
            backgroundColor: 'rgba(255, 111, 0, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Registration & Attendance Trends',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Students',
            },
          },
        },
      },
    });
  }

  createDepartmentDistributionChart(): void {
    const departmentData = this.groupSessionsByDepartment();

    // Destroy existing chart if it exists
    if (this.departmentDistributionChartInstance) {
      this.departmentDistributionChartInstance.destroy();
    }

    // Generate colors
    const colors = this.generateOrangeGradient(departmentData.length);

    const ctx = this.departmentDistributionChart.nativeElement.getContext('2d');
    this.departmentDistributionChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: departmentData.map((d) => d.name),
        datasets: [
          {
            data: departmentData.map((d) => d.registeredStudents),
            backgroundColor: colors,
            borderColor: colors.map((color) => this.darkenColor(color)),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Student Distribution by Department',
          },
        },
      },
    });
  }

  filterReports(): void {
    // Apply filters, reload data and reinitialize charts
    this.loading = true;

    // In a real app, you'd call the backend with filters
    // For now we'll just simulate filtering with a delay
    setTimeout(() => {
      this.processSessionsData();
      this.initializeCharts();
      this.loading = false;
    }, 500);
  }

  exportReportToExcel(): void {
    // Show loading state while generating report
    this.loading = true;

    // Create workbook and worksheets
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Orientation Management System';
    workbook.lastModifiedBy = 'Admin';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create summary worksheet
    const summarySheet = workbook.addWorksheet('Summary');
    this.addSummaryToWorksheet(summarySheet);

    // Create sessions worksheet
    const sessionsSheet = workbook.addWorksheet('Sessions');
    this.addSessionsToWorksheet(sessionsSheet);

    // Create departments worksheet
    const departmentsSheet = workbook.addWorksheet('Departments');
    this.addDepartmentsToWorksheet(departmentsSheet);

    // Generate Excel file
    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        // Create file name with current date
        const fileName = this.selectedDepartment
          ? `${
              this.departments.find(
                (d) => d.departmentID === this.selectedDepartment
              )?.departmentName
            }_report_${this.formatDate(new Date())}.xlsx`
          : `orientation_report_${this.formatDate(new Date())}.xlsx`;

        // Create blob and save file
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, fileName);

        this.loading = false;
      })
      .catch((err) => {
        console.error('Error generating Excel report:', err);
        this.loading = false;
        // Notify user of error
        alert('Error generating report. Please try again.');
      });
  }

  // Format date for filename
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  // Add summary data to worksheet
  private addSummaryToWorksheet(worksheet: ExcelJS.Worksheet): void {
    // Add title
    worksheet.addRow(['Orientation System Analytics Report']);
    worksheet.addRow(['Generated on:', new Date().toLocaleString()]);
    if (this.selectedDepartment) {
      const deptName = this.departments.find(
        (d) => d.departmentID === this.selectedDepartment
      )?.departmentName;
      worksheet.addRow(['Department:', deptName]);
    } else {
      worksheet.addRow(['Department:', 'All Departments']);
    }
    worksheet.addRow(['Date Range:', this.getDateRangeText()]);
    worksheet.addRow([]);

    // Add summary stats
    worksheet.addRow(['Summary Statistics']);
    worksheet.addRow(['Total Sessions:', this.stats.totalSessions || 0]);
    worksheet.addRow(['Total Departments:', this.stats.departments || 0]);
    worksheet.addRow(['Total Registrations:', this.stats.totalRegistered || 0]);
    worksheet.addRow(['Total Capacity:', this.stats.totalCapacity || 0]);
    worksheet.addRow([
      'Registration Rate:',
      `${
        this.stats.totalRegistered && this.stats.totalCapacity
          ? (
              (this.stats.totalRegistered / this.stats.totalCapacity) *
              100
            ).toFixed(1)
          : 0
      }%`,
    ]);
    worksheet.addRow(['Upcoming Sessions:', this.stats.upcomingSessions || 0]);
    worksheet.addRow(['Full Sessions:', this.stats.fullSessions || 0]);

    // Format title row
    const titleRow = worksheet.getRow(1);
    titleRow.font = { bold: true, size: 16 };
    worksheet.getRow(6).font = { bold: true };

    // Adjust column widths
    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(2).width = 15;
  }

  // Add sessions data to worksheet
  private addSessionsToWorksheet(worksheet: ExcelJS.Worksheet): void {
    // Add header row
    const headers = [
      'Department',
      'Session',
      'Date & Time',
      'Registered',
      'Capacity',
      'Attended',
      'Rate (%)',
    ];
    worksheet.addRow(headers);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' },
    };

    // Add data rows
    this.attendanceData.forEach((session) => {
      worksheet.addRow([
        session.department,
        session.title,
        session.date,
        session.registered,
        session.capacity,
        session.attended,
        session.rate,
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = Math.max(
        headers[worksheet.columns.indexOf(column)].length + 5,
        15
      );
    });
  }

  // Add departments data to worksheet
  private addDepartmentsToWorksheet(worksheet: ExcelJS.Worksheet): void {
    // Add header row
    const headers = [
      'Department',
      'Sessions',
      'Registered Students',
      'Attended Students',
      'Capacity',
      'Registration Rate (%)',
      'Attendance Rate (%)',
    ];
    worksheet.addRow(headers);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' },
    };

    // Add data rows
    const departmentData = this.groupSessionsByDepartment();
    departmentData.forEach((dept) => {
      const registrationRate =
        dept.capacity > 0 ? (dept.registeredStudents / dept.capacity) * 100 : 0;
      const attendanceRate =
        dept.registeredStudents > 0
          ? (dept.attendedStudents / dept.registeredStudents) * 100
          : 0;

      worksheet.addRow([
        dept.name,
        dept.sessions,
        dept.registeredStudents,
        dept.attendedStudents,
        dept.capacity,
        registrationRate.toFixed(1),
        attendanceRate.toFixed(1),
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = Math.max(
        headers[worksheet.columns.indexOf(column)].length + 5,
        15
      );
    });
  }

  // Get text description of date range
  private getDateRangeText(): string {
    switch (this.dateRange) {
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
      case 'custom':
        return 'Custom Range';
      default:
        return 'All Time';
    }
  }

  downloadSessionAttendance(sessionId: number, sessionName: string): void {
    this.orientationService.exportAttendees(sessionId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sessionName}_attendees.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (error) => console.error('Error exporting attendees', error),
    });
  }

  // Helper methods
  generateOrangeGradient(count: number): string[] {
    const baseColor = [255, 111, 0]; // Orange base color (ff6f00)
    const colors = [];

    for (let i = 0; i < count; i++) {
      // Mix with white for lighter shades
      const factor = i / Math.max(count - 1, 1); // 0 to 1
      const r = Math.round(baseColor[0] - 40 * factor);
      const g = Math.round(baseColor[1] + 80 * factor);
      const b = Math.round(baseColor[2] + 150 * factor);

      colors.push(`rgb(${r}, ${g}, ${b})`);
    }

    return colors;
  }

  darkenColor(color: string): string {
    // Simple function to darken a color for borders
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return '#000000';

    const r = Math.max(0, parseInt(rgb[0]) - 30);
    const g = Math.max(0, parseInt(rgb[1]) - 30);
    const b = Math.max(0, parseInt(rgb[2]) - 30);

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Track table sorting/pagination
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // In a real app, apply filter to dataSource
  }
}
