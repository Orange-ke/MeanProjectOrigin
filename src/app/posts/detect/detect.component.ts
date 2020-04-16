import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from '../post-create/mime-type.validator';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import boundled from '../../util';

@Component({
  selector: 'app-detect',
  templateUrl: './detect.component.html',
  styleUrls: ['./detect.component.css']
})

export class DetectComponent implements OnInit, OnDestroy, AfterViewInit {
  isSmallScreen = false;
  faceFrameRadio = 1;
  isGetResult = false;
  faceInfo: Array<'object'> = [];
  beautyKingScore = 0;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  accessToken: string;
  private authStatusSub: Subscription;

  @ViewChild('radioRef', null) element: ElementRef;
  htmlElement: HTMLElement;

  constructor(
    private http: HttpClient,
    public postService: PostService,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.authStatusSub = this.postService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
    this.form = new FormGroup({
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
    });

    if (window.screen.width < 600) {
      this.isSmallScreen = true;
    }

  }

  ngAfterViewInit() {
    this.htmlElement = this.element.nativeElement;
  }

  onImagePicked(event: Event) {
    this.imagePreview = '';
    const file = (event.target as HTMLInputElement).files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.setAttribute('crossOrigin', 'anonymous');
      image.onload = () => {
        const resizedData = boundled.resizeImg(image);
        const url = resizedData.url;
        const fileObject = boundled.urlToBlob(url);
        this.imagePreview = url;
        this.form.patchValue({ image: fileObject });
        this.form.get('image').updateValueAndValidity();
        this.faceFrameRadio = this.isSmallScreen ? this.htmlElement.offsetWidth / resizedData.resizedWidth : 1;
      };
      image.src = reader.result.toString();
    };
    reader.readAsDataURL(file);
  }

  onDetect() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.postService.detectPost(this.form.value.image).subscribe((responseData) => {
      this.isLoading = false;
      this.beautyKingScore = Math.max( ...responseData.result.face_list.map(item => item['beauty']) );
      this.isGetResult = true;
      this.faceInfo = responseData.result.face_list;
    }, error => {
      this.isLoading = false;
    });
  }

  setSearchInfo(faceInfo) {
    this.faceInfo = faceInfo;
    this.isGetResult = true;
  }

  clearSearchData() {
    this.isGetResult = false;
    this.faceInfo = [];
    this.imagePreview = '';
    this.form.patchValue({ image: null });
    this.form.get('image').updateValueAndValidity();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
