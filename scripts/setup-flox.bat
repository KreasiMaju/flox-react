@echo off
REM 🚀 Flox Setup Script for Windows
REM Script untuk setup Flox di project React baru

echo 🚀 Flox Setup Script
echo ====================

REM Check if we're in a React project
if not exist "package.json" (
    echo ❌ Error: package.json tidak ditemukan!
    echo Pastikan kamu berada di root directory project React
    pause
    exit /b 1
)

REM Check if React is installed
findstr /C:"react" package.json >nul
if errorlevel 1 (
    echo ❌ Error: React tidak ditemukan di package.json!
    echo Pastikan ini adalah project React
    pause
    exit /b 1
)

REM Check if Flox is already installed
findstr /C:"flox" package.json >nul
if not errorlevel 1 (
    echo ✅ Flox sudah terinstall!
    pause
    exit /b 0
)

echo 📦 Installing Flox...
npm install flox

if errorlevel 1 (
    echo ❌ Gagal install Flox
    pause
    exit /b 1
) else (
    echo ✅ Flox berhasil diinstall!
)

REM Create directories
echo 📁 Creating directories...
if not exist "src\controllers" mkdir src\controllers
if not exist "src\bindings" mkdir src\bindings
if not exist "src\components" mkdir src\components

REM Create sample controller
echo 🎮 Creating sample controller...
(
echo import { Controller, rxInt } from 'flox';
echo.
echo export class CounterController extends Controller {
echo   count = rxInt^(0^);
echo.  
echo   increment^(^) {
echo     this.count.value++;
echo   }
echo.  
echo   decrement^(^) {
echo     this.count.value--;
echo   }
echo.  
echo   reset^(^) {
echo     this.count.value = 0;
echo   }
echo }
) > src\controllers\CounterController.ts

REM Create sample component
echo 🎨 Creating sample component...
(
echo import React from 'react';
echo import { useController, useRx } from 'flox';
echo import { CounterController } from '../controllers/CounterController';
echo.
echo function Counter^(^) {
echo   const controller = useController^(new CounterController^(^)^);
echo   const [count] = useRx^(controller.count^);
echo.  
echo   return ^(
echo     ^<div style={{ padding: '20px', textAlign: 'center' }}^>
echo       ^<h1^>Flox Counter Demo^</h1^>
echo       ^<h2^>Count: {count}^</h2^>
echo       ^<div style={{ marginTop: '20px' }}^>
echo         ^<button 
echo           onClick={^(^) =^> controller.increment^(^)}
echo           style={{ margin: '0 10px', padding: '10px 20px' }}
echo         ^>
echo           + Increment
echo         ^</button^>
echo         ^<button 
echo           onClick={^(^) =^> controller.decrement^(^)}
echo           style={{ margin: '0 10px', padding: '10px 20px' }}
echo         ^>
echo           - Decrement
echo         ^</button^>
echo         ^<button 
echo           onClick={^(^) =^> controller.reset^(^)}
echo           style={{ margin: '0 10px', padding: '10px 20px' }}
echo         ^>
echo           Reset
echo         ^</button^>
echo       ^</div^>
echo     ^</div^>
echo   ^);
echo }
echo.
echo export default Counter;
) > src\components\Counter.tsx

REM Create sample binding
echo 🔗 Creating sample binding...
(
echo import { Binding } from 'flox';
echo import { CounterController } from '../controllers/CounterController';
echo.
echo export class AppBinding extends Binding {
echo   dependencies^(^) {
echo     this.putController^('counter', new CounterController^(^)^);
echo   }
echo }
) > src\bindings\AppBinding.ts

REM Update App.tsx if it exists
if exist "src\App.tsx" (
    echo 📝 Updating App.tsx...
    (
    echo import React from 'react';
    echo import Counter from './components/Counter';
    echo.
    echo function App^(^) {
    echo   return ^(
    echo     ^<div className="App"^>
    echo       ^<Counter /^>
    echo     ^</div^>
    echo   ^);
    echo }
    echo.
    echo export default App;
    ) > src\App.tsx
)

REM Create README for the project
echo 📚 Creating project README...
(
echo # 🚀 Flox Project Setup
echo.
echo Project ini sudah disetup dengan Flox state management!
echo.
echo ## 🎯 What's Included
echo.
echo - ✅ Flox library installed
echo - ✅ Sample CounterController
echo - ✅ Sample Counter component
echo - ✅ Sample AppBinding
echo - ✅ Updated App.tsx
echo.
echo ## 🚀 Quick Start
echo.
echo ```bash
echo # Install dependencies
echo npm install
echo.
echo # Start development server
echo npm run dev
echo # atau
echo npm start
echo ```
echo.
echo ## 📁 Project Structure
echo.
echo ```
echo src/
echo ├── controllers/
echo │   └── CounterController.ts    # Sample controller
echo ├── bindings/
echo │   └── AppBinding.ts          # Sample binding
echo ├── components/
echo │   └── Counter.tsx            # Sample component
echo └── App.tsx                    # Main app
echo ```
echo.
echo ## 🎮 Test Flox
echo.
echo 1. Buka browser ke `http://localhost:3000`
echo 2. Klik tombol Increment/Decrement/Reset
echo 3. Lihat counter berubah secara real-time!
echo.
echo ## 📖 Next Steps
echo.
echo - Baca dokumentasi: [README.md](./README.md^)
echo - Ikuti tutorial: [GETTING_STARTED.md](./GETTING_STARTED.md^)
echo - Lihat cheat sheet: [CHEAT_SHEET.md](./CHEAT_SHEET.md^)
echo.
echo ## 🛠️ Development
echo.
echo ```bash
echo # Create new controller
echo touch src/controllers/MyController.ts
echo.
echo # Create new component
echo touch src/components/MyComponent.tsx
echo.
echo # Create new binding
echo touch src/bindings/MyBinding.ts
echo ```
echo.
echo Happy coding with Flox! 🎉
) > FLOX_README.md

echo.
echo 🎉 Setup selesai! Flox berhasil disetup di project kamu!
echo.
echo 📁 Files yang dibuat:
echo   - src\controllers\CounterController.ts
echo   - src\components\Counter.tsx
echo   - src\bindings\AppBinding.ts
echo   - FLOX_README.md
echo.
echo 🚀 Langkah selanjutnya:
echo   1. npm run dev (atau npm start^)
echo   2. Buka http://localhost:3000
echo   3. Test counter app!
echo.
echo 📖 Dokumentasi:
echo   - README.md - Dokumentasi lengkap
echo   - GETTING_STARTED.md - Tutorial pemula
echo   - CHEAT_SHEET.md - Referensi cepat
echo   - INSTALLATION.md - Panduan instalasi
echo.
echo Happy coding with Flox! 🎉
pause 