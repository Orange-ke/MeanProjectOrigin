
import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

const BASE_URL = environment.apiUrl +  'posts/';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) { }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    console.log(BASE_URL);
    this.http
      .get<{ message: string, posts: any, maxPosts: number }>(BASE_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              user_id: post.user_id,
              face_token: post.face_token,
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          maxPosts: postData.maxPosts
        };
      }))
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({ posts: [...this.posts], postCount: transformedPostData.maxPosts });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    // const post: Post = { id: null, title, content, imagePath: null };
    this.http
      .post<{ message: string, post: Post }>(BASE_URL, postData)
      .subscribe((responseData) => {
        // const postGetted: Post = {id: responseData.post.id, title, content, imagePath: responseData.post.imagePath};
        // this.posts.push(postGetted);
        // this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  getPost(id: string) {
    // return {...this.posts.find(p => p.id === id)};
    return this.http
    .get<{ _id: string, user_id: string, face_token: string, title: string, content: string, imagePath: string, creator: string }>
    (BASE_URL + id);
  }

  updataPost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object' ) {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        user_id: '',
        face_token: '',
        title,
        content,
        imagePath: image,
        creator: null
      };
    }
    this.http.put(BASE_URL + id, postData)
      .subscribe(response => {
        // const updatedPosts = [...this.posts];
        // const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        // const post: Post = {
        //   id,
        //   title,
        //   content,
        //   imagePath: 'response.imagePath'
        // };
        // updatedPosts[oldPostIndex] = post;
        // this.posts = updatedPosts;
        // this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  searchPost(image: File) {
    const postData = new FormData();
    postData.append('image', image);
    return this.http
      .post<{ message: string, result: 'object' }>(BASE_URL + 'search', postData);
  }

  detectPost(image: File) {
    const postData = new FormData();
    postData.append('image', image);
    return this.http
      .post<{ message: string, result: {face_list: Array<'object'>} }>(BASE_URL + 'detect', postData);
  }

  comparePost(imageArry: Array<File>) {
    const postData = new FormData();
    for (const image of imageArry) {
      postData.append('images', image);
    }
    return this.http
      .post<{ message: string, result: { score: number } }>(BASE_URL + 'compare', postData);
  }

  deletePost(postId: string, params: object) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        ...params
      }
    };
    return this.http.delete(BASE_URL + postId, options);
  }
}
