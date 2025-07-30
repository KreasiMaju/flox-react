import { Binding } from '../core/Binding';
import { HomeController } from '../controllers/HomeController';
import { UserController } from '../controllers/UserController';
import { AppController } from '../controllers/AppController';
import { SettingsController } from '../controllers/SettingsController';

export class HomeBinding extends Binding {
  dependencies(): void {
    // Normal controller
    this.putController<HomeController>('home', new HomeController());
    
    // Fenix controller (recreate setiap kali dibutuhkan)
    this.putFenix<UserController>('user', () => new UserController());
    
    // Permanent controller (tidak pernah di-dispose)
    this.putPermanent<AppController>('app', new AppController());
    
    // Lazy controller (hanya dibuat saat pertama kali diakses)
    this.lazyPut<SettingsController>('settings', () => new SettingsController());
  }
} 