import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from '../post-create/mime-type.validator';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import boundled from '../../util';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
  isSmallScreen = false;
  faceFrameRadio = 1;
  isGetResult = false;
  facesInfo: Array<object>;
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
        const fileObject = boundled.urlToBlob(resizedData.url);
        this.imagePreview = resizedData.url;
        this.form.patchValue({ image: fileObject });
        this.form.get('image').updateValueAndValidity();
        this.faceFrameRadio = this.isSmallScreen ? this.htmlElement.offsetWidth / resizedData.resizedWidth : 1;
      };
      image.src = reader.result.toString();
    };
    reader.readAsDataURL(file);
  }

  onSearch() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.postService.searchPost(this.form.value.image).subscribe((responseData) => {
      this.isLoading = false;
      this.setSearchInfo(responseData.result);
    }, error => {
      this.isLoading = false;
    });
  }

  setSearchInfo(facesInfo) {
    this.facesInfo = facesInfo;
    this.isGetResult = true;
  }

  clearSearchData() {
    this.facesInfo = [];
    this.isGetResult = false;
    this.imagePreview = '';
    this.form.patchValue({ image: null });
    this.form.get('image').updateValueAndValidity();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
