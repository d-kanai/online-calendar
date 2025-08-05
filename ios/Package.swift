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
            name: "AppBridge",
            targets: ["AppBridge"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/nalexn/ViewInspector", from: "0.10.2")
    ],
    targets: [
        .target(
            name: "Core",
            dependencies: []
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
            name: "AppBridge",
            dependencies: ["Core", "Auth", "Meeting", "Stats"]
        ),
        .testTarget(
            name: "CoreTests",
            dependencies: [
                "Core",
                .product(name: "ViewInspector", package: "ViewInspector")
            ]
        ),
        .testTarget(
            name: "AuthTests",
            dependencies: [
                "Auth",
                .product(name: "ViewInspector", package: "ViewInspector")
            ]
        ),
        .testTarget(
            name: "MeetingTests",
            dependencies: [
                "Meeting",
                .product(name: "ViewInspector", package: "ViewInspector")
            ]
        ),
        .testTarget(
            name: "StatsTests",
            dependencies: [
                "Stats",
                .product(name: "ViewInspector", package: "ViewInspector")
            ]
        ),
    ]
)