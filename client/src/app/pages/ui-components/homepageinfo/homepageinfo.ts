import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { environment } from '../../../environments/environment.development';
import { AuthService } from 'src/app/_services/auth.service';

import { HomePageInfoService } from '../../../_services/home-page-info.service';
import { HomePageInfo } from '../../../_models/home-page-info';

@Component({
  selector: 'app-homepageinfo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIcon,
    TranslateModule,
    FileUploadModule
  ],
  templateUrl: './homepageinfo.html',
  styleUrl: './homepageinfo.scss'
})
export class Homepageinfo implements OnInit {
  baseUrl = environment.apiUrl;

  coverUploader = new FileUploader({ url: '' });
  image2Uploader = new FileUploader({ url: '' });

  coverPreview: string | null = null;
  image2Preview: string | null = null;
  private fb = inject(FormBuilder);
  private service = inject(HomePageInfoService);
  private snack = inject(MatSnackBar);
  private authService = inject(AuthService);

  form = this.fb.group({
    id: [0],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    openingTime: ['', Validators.required],
    closingTime: ['', Validators.required],
    latitude: [0, Validators.required],
    longitude: [0, Validators.required],
    imageCoverUrl: [''],
    image2Url: ['']
  });

  ngOnInit(): void {
    this.load();
    this.initializeCoverUploader();
    this.initializeImage2Uploader();

  }

  onPhoneInput() {
    const control = this.form.get('phoneNumber');

    if (!control) return;

    const numbersOnly = (control.value || '').replace(/\D/g, '');
    control.setValue(numbersOnly, { emitEvent: false });
  }

  private toTimeSpan(time: string | null): string {
    if (!time) return '';

    // Already HH:mm:ss
    if (time.split(':').length === 3) {
      return time;
    }

    // Convert HH:mm -> HH:mm:ss
    return `${time}:00`;
  }

  load() {
    this.service.getHomeInfo().subscribe({
      next: (res) => {

        this.form.patchValue(res);

        this.coverPreview = res.imageCoverUrl ?? null;
        this.image2Preview = res.image2Url ?? null;
      },
      error: err => console.error(err)
    });
  }

  initializeCoverUploader() {

    this.coverUploader = new FileUploader({

      url: this.baseUrl + 'HomeInfo/AddOrReplacePhoto/cover',

      authToken: 'Bearer ' + this.authService.currentEmployee?.token,

      allowedFileType: ['image'],

      removeAfterUpload: true,

      autoUpload: false,

      isHTML5: true
    });

    this.coverUploader.onAfterAddingFile = file => {

      file.withCredentials = false;

      this.coverPreview = URL.createObjectURL(file._file);
    };

    this.coverUploader.onSuccessItem = (item, response) => {

      const result = JSON.parse(response);

      this.form.patchValue({
        imageCoverUrl: result.imageCoverUrl
      });

      this.coverPreview = result.imageCoverUrl;
    };
  }

  initializeImage2Uploader() {

    this.image2Uploader = new FileUploader({

      url: this.baseUrl + 'HomeInfo/AddOrReplacePhoto/image2',

      authToken: 'Bearer ' + this.authService.currentEmployee?.token,

      allowedFileType: ['image'],

      removeAfterUpload: true,

      autoUpload: false,

      isHTML5: true
    });

    this.image2Uploader.onAfterAddingFile = file => {

      file.withCredentials = false;

      this.image2Preview = URL.createObjectURL(file._file);
    };

    this.image2Uploader.onSuccessItem = (item, response) => {

      const result = JSON.parse(response);

      this.form.patchValue({
        image2Url: result.image2Url
      });

      this.image2Preview = result.image2Url;
    };
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const dto: HomePageInfo = {
      id: value.id ?? undefined,
      email: value.email ?? '',
      phoneNumber: value.phoneNumber ?? '',
      openingTime: this.toTimeSpan(value.openingTime),
      closingTime: this.toTimeSpan(value.closingTime),
      latitude: value.latitude ?? 0,
      longitude: value.longitude ?? 0,
      imageCoverUrl: value.imageCoverUrl ?? '',
      image2Url: value.image2Url ?? ''
    };

    console.log(dto);

    this.service.updateHomeInfo(dto).subscribe({
      next: () => {
        this.snack.open('Home information updated successfully.', 'Close', {
          duration: 3000
        });
      },
      error: (err) => console.error(err)
    });
  }
}