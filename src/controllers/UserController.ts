import { Controller } from '../core/Controller';

export interface UserControllerInterface {
  userId: string;
  username: string;
  setUser(userId: string, username: string): void;
  clearUser(): void;
}

export class UserController extends Controller implements UserControllerInterface {
  private _userIdSubject = this.createSubject('userId', '');
  private _usernameSubject = this.createSubject('username', '');

  get userId(): string {
    return this._userIdSubject.value;
  }

  get username(): string {
    return this._usernameSubject.value;
  }

  setUser(userId: string, username: string): void {
    this._userIdSubject.next(userId);
    this._usernameSubject.next(username);
  }

  clearUser(): void {
    this._userIdSubject.next('');
    this._usernameSubject.next('');
  }

  onInit(): void {
    console.log('UserController initialized');
  }

  onDispose(): void {
    console.log('UserController disposed');
    super.onDispose();
  }
} 