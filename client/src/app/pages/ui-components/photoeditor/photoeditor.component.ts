import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { DecimalPipe, NgIf, NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../_services/menu.service';
import { AuthService } from 'src/app/_services/auth.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-photoeditor',
  standalone: true,
  imports: [NgIf, NgStyle, FileUploadModule, DecimalPipe ,TranslateModule],
  templateUrl: './photoeditor.component.html',
  styleUrls: ['./photoeditor.component.css']
})
export class PhotoeditorComponent implements OnInit {

  uploader = new FileUploader({ url: '' });

  baseUrl = environment.apiUrl;
  itemId = 0;
  branchId = 0;

  previewUrl: string | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    public menuservice: MenuService,
    private myroute: ActivatedRoute,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {

    this.itemId = Number(this.myroute.snapshot.params['id']);
    this.branchId = Number(this.myroute.snapshot.params['branchID']);

    if (!this.itemId) return;

    this.loadCurrentPhoto();
    this.initializeUploader();
  }

  loadCurrentPhoto(): void {
    this.menuservice.getPhoto(this.itemId).subscribe({
      next: (photo) => {
        this.previewUrl = photo?.url ?? null;
      },
      error: () => this.previewUrl = null
    });
  }

  initializeUploader(): void {

    this.uploader = new FileUploader({
      url: `${this.baseUrl}menu/AddOrReplacePhoto/${this.itemId}`,
      authToken: 'Bearer ' + this.employeeService.currentEmployee()?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    // 👇 IMAGE PREVIEW
    this.uploader.onAfterAddingFile = (file) => {

      file.withCredentials = false;

      // keep only one file
      if (this.uploader.queue.length > 1) {
        this.uploader.clearQueue();
        this.uploader.addToQueue([file._file]);
      }

      // 👉 CREATE PREVIEW URL
      this.previewUrl = URL.createObjectURL(file._file);
    };

          // Navigate back to edit page after upload
    this.uploader.onSuccessItem = () => {

        this.router.navigate(['/ui-components', 'edititem', this.itemId , this.branchId]);
    setTimeout(() => window.location.reload(), 100);
    }

  }
}