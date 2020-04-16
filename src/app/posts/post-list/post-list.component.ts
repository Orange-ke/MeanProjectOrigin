import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostService } from '../posts.service';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {

  totalPosts = 0;
  postsPerPage = 3;
  pageSizeOptions = [3, 6, 9];
  currentPage = 1;
  isLoading = false;
  posts: Post[] = [];
  userId: string;
  private postSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public postService: PostService, public authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, 1);
    this.userId = this.authService.getUserId();
    this.postSub = this.postService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], postCount: number}) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
        if (this.currentPage > 1 && this.posts.length <= 0) {
          // 此时需要后退一页
        }
      }, error => {
        console.log(error);
      }, () => {
        console.log('complete');
      });
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(isAth => {
        this.userId = this.authService.getUserId();
      });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string, params: object) {
    this.postService.deletePost(postId, params).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  ngOnDestroy() {
    this.postSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
