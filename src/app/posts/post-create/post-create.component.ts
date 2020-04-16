import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import boundled from '../../util';

@Component({
  selector: 'app-post-create',
  templateUrl: 'post-create.component.html',
  styleUrls: ['post-create.component.css']
})

export class PostCreateComponent implements OnInit, OnDestroy {

  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;
  public post: Post;
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
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(1)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.isLoading = true;
        this.postId = paramMap.get('postId');
        this.postService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.imagePreview = postData.imagePath;
          this.post = { id: postData._id,
            user_id: postData.user_id,
            face_token: postData.face_token,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator
          };
          this.form.setValue({ title: this.post.title, content: this.post.content, image: this.post.imagePath });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
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
        console.log(resizedData.resizedWidth);
        const fileObject = boundled.urlToBlob(url);
        this.imagePreview = url;
        this.form.patchValue({ image: fileObject });
        this.form.get('image').updateValueAndValidity();
      };
      image.src = reader.result.toString();
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postService.updataPost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
