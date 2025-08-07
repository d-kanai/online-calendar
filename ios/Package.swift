// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "OnlineCalendar",
    platforms: [
        .iOS(.v17),
        .macOS(.v12)
    ],
    products: [
        .library(
            name: "Core",
            targets: ["Core"]
        ),
        .library(
            name: "Auth",
            targets: ["Auth"]
        ),
        .library(
            name: "Meeting",
            targets: ["Meeting"]
        ),
        .library(
            name: "Stats",
            targets: ["Stats"]
        ),
        .library(
            name: "Home",
            targets: ["Home"]
        ),
        .library(
            name: "AppBridge",
            targets: ["AppBridge"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/nalexn/ViewInspector", from: "0.10.2"),
        .package(url: "https://github.com/elai950/AlertToast", from: "1.3.9")
    ],
    targets: [
        .target(
            name: "Core",
            dependencies: [
                .product(name: "AlertToast", package: "AlertToast")
            ]
        ),
        .target(
            name: "Auth",
            dependencies: ["Core"],
            path: "Sources/Features/Auth"
        ),
        .target(
            name: "Meeting",
            dependencies: ["Core"],
            path: "Sources/Features/Meeting"
        ),
        .target(
            name: "Stats",
            dependencies: ["Core"],
            path: "Sources/Features/Stats"
        ),
        .target(
            name: "Home",
            dependencies: ["Core"],
            path: "Sources/Features/Home"
        ),
        .target(
            name: "AppBridge",
            dependencies: ["Core", "Auth", "Meeting", "Stats", "Home"]
        ),
        .testTarget(
            name: "CoreTests",
            dependencies: [
                "Core",
                .product(name: "ViewInspector", package: "ViewInspector")
            ],
            path: "Tests/CoreTests"
        ),
        .testTarget(
            name: "AuthTests",
            dependencies: [
                "Auth",
                .product(name: "ViewInspector", package: "ViewInspector")
            ],
            path: "Tests/Features/Auth"
        ),
        .testTarget(
            name: "MeetingTests",
            dependencies: [
                "Meeting",
                .product(name: "ViewInspector", package: "ViewInspector")
            ],
            path: "Tests/Features/Meeting"
        ),
        .testTarget(
            name: "StatsTests",
            dependencies: [
                "Stats",
                .product(name: "ViewInspector", package: "ViewInspector")
            ],
            path: "Tests/Features/Stats"
        ),
        .testTarget(
            name: "HomeTests",
            dependencies: [
                "Home",
                .product(name: "ViewInspector", package: "ViewInspector")
            ],
            path: "Tests/Features/HomeTests"
        ),
    ]
)