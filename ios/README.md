# 📱 iOS Project Structure

This iOS project follows a **Swift Package Manager (SPM) centered architecture**, cleanly separating the reusable Swift Package from the Xcode-specific app project.

## 🏗️ Directory Structure

```
ios/
├── 📦 Package.swift                 # Swift Package manifest
├── 📄 Package.resolved             # Resolved package dependencies
│
├── 📂 Sources/                     # Swift Package sources
│   └── 📚 Core/                    # Core library module
│       ├── 🔐 Auth/                # Authentication features
│       │   ├── Models/             # Data models (SignInForm)
│       │   ├── Repositories/       # API layer (AuthRepository)
│       │   ├── Services/           # Business logic (AuthState)
│       │   ├── ViewModels/         # Presentation logic (SignInViewModel)
│       │   └── Views/              # SwiftUI views (SignInScreen)
│       │
│       ├── 🧩 Common/              # Shared components
│       │   ├── Models/             # Common data models (User, APIResponse)
│       │   ├── Services/           # Shared services (APIClient)
│       │   ├── Utils/              # Utilities (DateFormatter+Extensions)
│       │   └── Views/              # Reusable UI components
│       │       ├── Atoms/          # Basic components (PrimaryButton, InputField)
│       │       └── RootView.swift  # App root view
│       │
│       └── 📅 Meeting/             # Meeting management features
│           ├── Models/             # Meeting data models
│           ├── Repositories/       # Meeting API layer
│           ├── ViewModels/         # Meeting presentation logic
│           └── Views/              # Meeting UI (MeetingListScreen)
│
├── 🧪 Tests/                       # Swift Package tests
│   └── CoreTests/                  # Core module tests
│       ├── MeetingListScreenSpec.swift
│       ├── SignInScreenSpec.swift
│       └── Mocks/                  # Test doubles
│
├── 🍎 App/                         # Xcode-specific files
│   ├── 📱 OnlineCalendar.xcodeproj # Xcode project file
│   └── 📂 OnlineCalendar/          # iOS app target
│       ├── OnlineCalendarApp.swift # App entry point
│       ├── Assets.xcassets/        # App assets
│       └── Preview Content/        # SwiftUI preview assets
│
├── 🛠️ build/                       # Build artifacts
├── 📊 coverage/                    # Test coverage reports
└── 🧹 .gitignore                  # Git ignore rules
```

## 🎯 Architecture Overview

### 📦 Swift Package (`Sources/Core/`)
- **Platform-independent** business logic and UI components
- Can be imported into other Swift projects
- Follows standard SPM directory structure
- Contains all the app's core functionality

### 🍎 Xcode App (`App/`)
- Platform-specific configuration
- App lifecycle management
- Asset catalogs and resources
- Xcode project settings

## 🔧 Key Commands

```bash
# Run Swift Package tests
swift test

# Build Swift Package
swift build

# Open Xcode project
open App/OnlineCalendar.xcodeproj

# Or better, open via Package.swift for SPM integration
open Package.swift
```

## 🏛️ Module Architecture

Each feature module follows a consistent structure:

- **📁 Models/** - Data structures and DTOs
- **📁 Repositories/** - API communication layer
- **📁 Services/** - Business logic and state management
- **📁 ViewModels/** - Presentation logic (MVVM pattern)
- **📁 Views/** - SwiftUI views and components

## 🧪 Testing

- Unit tests use Apple's native Testing framework
- UI tests use ViewInspector for SwiftUI view testing
- E2E tests use Maestro (see `/ios_e2e` directory)

## 📚 Dependencies

- **ViewInspector** - SwiftUI view testing framework
- All dependencies managed via Swift Package Manager