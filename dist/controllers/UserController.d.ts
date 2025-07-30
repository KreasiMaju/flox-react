import { Controller } from '../core/Controller';
export interface UserControllerInterface {
    userId: string;
    username: string;
    setUser(userId: string, username: string): void;
    clearUser(): void;
}
export declare class UserController extends Controller implements UserControllerInterface {
    private _userIdSubject;
    private _usernameSubject;
    get userId(): string;
    get username(): string;
    setUser(userId: string, username: string): void;
    clearUser(): void;
    onInit(): void;
    onDispose(): void;
}
//# sourceMappingURL=UserController.d.ts.map