# Control de Asistencias - Ionic React App

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/control-asistencias.git
cd control-asistencias
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Ejecutar en Desarrollo Web
```bash
npm start
# o
ionic serve
```

La aplicación estará disponible en `http://localhost:8100`

## Conversión a Android

### Paso 1: Instalar Capacitor y Plataformas
```bash
# Instalar dependencias de Capacitor
npm install @capacitor/android @capacitor/ios

# Compilar el proyecto
npm run build
```

### Paso 2: Configurar Android Studio

#### 2.1 Descargar Android Studio
- Descargar desde: https://developer.android.com/studio
- Instalar con configuración por defecto
- Completar setup inicial

#### 2.2 Configurar Variables de Entorno (Windows)

**PowerShell como Administrador:**
```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\tools;$env:LOCALAPPDATA\Android\Sdk\platform-tools", "User")
```

**Método Manual:**
1. `Win + R` → `sysdm.cpl` → Enter
2. "Avanzado" → "Variables de entorno"
3. Nueva variable de usuario:
   - Variable: `ANDROID_HOME`
   - Valor: `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk`
4. Editar `PATH` y agregar:
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\platform-tools`

**Verificar configuración:**
```bash
# Reiniciar terminal y verificar
echo $env:ANDROID_HOME
```

### Paso 3: Crear Proyecto Android
```bash
# Agregar plataforma Android
npx cap add android

# Sincronizar archivos
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

### Paso 4: Configurar Emulador/Dispositivo

#### Opción A: Emulador (Recomendado)
1. En Android Studio → **"Device Manager"**
2. **"Create Virtual Device"**
3. Seleccionar **"Phone"** → **"Pixel 6"** → **"Next"**
4. Descargar **"API 34"** (Android 14) → **"Finish"**

#### Opción B: Dispositivo Físico
1. Activar **"Opciones de desarrollador"** en Android
2. Activar **"Depuración USB"**
3. Conectar por USB

### Paso 5: Ejecutar la App
1. Esperar a que Android Studio termine de sincronizar
2. Seleccionar dispositivo/emulador en la barra superior
3. Click en **▶️ "Run"**

## Generar APK para Distribución

### Método 1: APK Debug (Para Pruebas)
```bash
# En Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```
**Ubicación:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Método 2: APK Release (Para Distribución)
```bash
# En Android Studio:
# Build → Generate Signed Bundle / APK
```

**Pasos detallados:**
1. Seleccionar **"APK"** → **"Next"**
2. **"Create new..."** (primera vez)
3. **Configurar keystore:**
   - Path: `C:\ruta\a\tu\keystore.jks`
   - Password: Contraseña segura
   - Alias: `asistencias-key`
   - Llenar datos de organización
4. **"OK"** → **"Next"**
5. Seleccionar **"release"** → **"Create"**

**Ubicación:** `android/app/build/outputs/apk/release/app-release.apk`

## Comandos Útiles

### Desarrollo Continuo
```bash
# Después de cambios en el código
npm run build
npx cap sync android

# Live reload (opcional)
npx cap run android --livereload --external
```

### Verificar Configuración
```bash
# Ver plataformas instaladas
npx cap ls

# Ver información del proyecto
ionic info
```

## Estructura del Proyecto

```
src/
├── pages/
│   ├── LoginPage.tsx       # Página de inicio de sesión
│   └── AttendancePage.tsx  # Página de registro de asistencias
├── App.tsx                 # Configuración de rutas
├── theme/
│   └── variables.css       # Variables de tema personalizado
└── public/
    └── log.jpg            # Imagen de fondo

android/                   # Proyecto Android generado
├── app/
│   ├── build/
│   │   └── outputs/
│   │       └── apk/       # APKs generadas aquí
│   └── src/main/
├── gradle/
└── build.gradle

capacitor.config.ts        # Configuración de Capacitor
```
