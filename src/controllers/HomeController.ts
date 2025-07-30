import { Controller } from '../core/Controller';
import { Subject } from '../core/Subject';

// Interface untuk ViewModel
export interface HomeViewModel {
  count: number;
  name: string;
  isLoading: boolean;
}

// Interface untuk Controller
export interface HomeControllerInterface {
  viewModel: HomeViewModel;
  increment(): void;
  decrement(): void;
  updateName(name: string): void;
  setLoading(loading: boolean): void;
}

// Repository interface (untuk business logic)
export interface HomeControllerRepository {
  fetchData(): Promise<void>;
  saveData(data: any): Promise<void>;
}

// Controller implementation
export class HomeController extends Controller implements HomeControllerInterface, HomeControllerRepository {
  // ViewModel subjects
  private _countSubject: Subject<number>;
  private _nameSubject: Subject<string>;
  private _loadingSubject: Subject<boolean>;

  constructor() {
    super();
    
    // Initialize subjects
    this._countSubject = this.createSubject('count', 0);
    this._nameSubject = this.createSubject('name', 'Flox User');
    this._loadingSubject = this.createSubject('isLoading', false);
  }

  // ViewModel getter
  get viewModel(): HomeViewModel {
    return {
      count: this._countSubject.value,
      name: this._nameSubject.value,
      isLoading: this._loadingSubject.value
    };
  }

  // Controller methods
  increment(): void {
    const currentCount = this._countSubject.value;
    this._countSubject.next(currentCount + 1);
  }

  decrement(): void {
    const currentCount = this._countSubject.value;
    this._countSubject.next(currentCount - 1);
  }

  updateName(name: string): void {
    this._nameSubject.next(name);
  }

  setLoading(loading: boolean): void {
    this._loadingSubject.next(loading);
  }

  // Repository methods
  async fetchData(): Promise<void> {
    this.setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update data
      this.updateName('Data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      this.updateName('Error loading data');
    } finally {
      this.setLoading(false);
    }
  }

  async saveData(data: any): Promise<void> {
    this.setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Data saved:', data);
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      this.setLoading(false);
    }
  }

  // Lifecycle
  onInit(): void {
    console.log('HomeController initialized');
    // Load initial data
    this.fetchData();
  }

  onDispose(): void {
    console.log('HomeController disposed');
    super.onDispose();
  }
} 