
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from '../post-create/mime-type.validator';
import { Subscription } from 'rxjs';
import boundled from '../../util';

@Component({
  selector: 'app-post-compare',
  templateUrl: 'compare.component.html',
  styleUrls: ['compare.component.css']
})

export class CompareComponent implements OnInit, OnDestroy {

  score = 0;
  isGetResult = false;
  isLoading = false;
  form: FormGroup;
  imagePreview1: string;
  imagePreview2: string;
  private authStatusSub: Subscription;

  constructor(
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
      image_1: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] }),
      image_2: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
    });
  }

  onImagePicked(event: Event, imageIdx: string) {
    if (imageIdx === 'image_1') {
      this.imagePreview1 = '';
    } else if (imageIdx === 'image_2') {
      this.imagePreview2 = '';
    }
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
        if (imageIdx === 'image_1') {
          this.imagePreview1 = url;
          this.form.patchValue({ image_1: fileObject });
        } else if (imageIdx === 'image_2') {
          this.imagePreview2 = url;
          this.form.patchValue({ image_2: fileObject });
        }
        this.form.get(imageIdx).updateValueAndValidity();
      };
      image.src = reader.result.toString();
    };
    reader.readAsDataURL(file);
  }

  onCompare() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.postService.comparePost([this.form.value.image_1, this.form.value.image_2]).subscribe((responseData) => {
      this.isLoading = false;
      this.isGetResult = true;
      this.score = responseData.result.score;
    }, error => {
      this.isLoading = false;
    });
  }

  clearCompareData() {
    this.isGetResult = false;
    this.imagePreview1 = '';
    this.imagePreview2 = '';
    this.form.patchValue({ image1: null });
    this.form.patchValue({ image2: null });
    this.form.get('image_1').updateValueAndValidity();
    this.form.get('image_2').updateValueAndValidity();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
