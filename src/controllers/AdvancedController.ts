import { Controller } from '../core/Controller';
import { Rx, rxInt, rxString, rxBool } from '../core/Rx';
import { Get } from '../core/Get';
import { BackgroundWorker } from '../core/Worker';

export interface AdvancedControllerInterface {
  count: Rx<number>;
  name: Rx<string>;
  isLoading: Rx<boolean>;
  increment(): void;
  decrement(): void;
  updateName(name: string): void;
  startBackgroundTask(): void;
  showSnackbar(): void;
  showDialog(): void;
}

export class AdvancedController extends Controller implements AdvancedControllerInterface {
  // Rx variables
  count = rxInt(0);
  name = rxString('Advanced User');
  isLoading = rxBool(false);

  constructor() {
    super();
    
    // Register worker
    BackgroundWorker.create('background-task', async () => {
      this.isLoading.value = true;
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.count.value += 10;
      this.isLoading.value = false;
      Get.snackbar('Background task completed!');
    });
  }

  increment(): void {
    this.count.value++;
  }

  decrement(): void {
    this.count.value--;
  }

  updateName(name: string): void {
    this.name.value = name;
  }

  startBackgroundTask(): void {
    BackgroundWorker.start('background-task');
  }

  showSnackbar(): void {
    Get.snackbar(`Hello ${this.name.value}! Count is ${this.count.value}`);
  }

  async showDialog(): Promise<void> {
    const confirmed = await Get.dialog(
      'Confirmation', 
      `Are you sure you want to reset count from ${this.count.value} to 0?`
    );
    
    if (confirmed) {
      this.count.value = 0;
      Get.snackbar('Count reset to 0!');
    }
  }

  onInit(): void {
    console.log('AdvancedController initialized with Rx variables');
  }

  onDispose(): void {
    BackgroundWorker.delete('background-task');
    this.count.dispose();
    this.name.dispose();
    this.isLoading.dispose();
    super.onDispose();
  }
} 