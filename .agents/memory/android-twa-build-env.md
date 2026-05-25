---
name: Android TWA build environment setup
description: Non-obvious steps required to build a Bubblewrap TWA in the Replit nix environment
---

## Problem
Bubblewrap 1.24.1 build in the Replit nix environment requires several non-obvious workarounds.

## JDK version
nix only provides up to JDK 16 headless (`nixpkgs.jdk16_headless`). Android cmdline-tools 11076708 require Java 17+ (class file version 61.0). Fix: download Temurin JDK 17 directly from Adoptium and extract to `/home/runner/jdk17`. Set `JAVA_HOME=/home/runner/jdk17` and prepend to PATH.

## Android SDK cmdline-tools
Use the older cmdline-tools release `commandlinetools-linux-9477386_latest.zip` (sdkmanager v9.0) — it works with Java 16/17. The newer `11076708` requires Java 17. Install to `/home/runner/android-sdk/cmdline-tools/latest`.

## Bubblewrap SDK path validation
Bubblewrap's `AndroidSdkTools.validatePath()` checks for a `tools/` OR `bin/` subdirectory at the SDK root. The modern SDK layout puts tools under `cmdline-tools/` instead. Fix: `ln -s /home/runner/android-sdk/cmdline-tools/latest /home/runner/android-sdk/tools`.

## Interactive prompts (Node.js v24 incompatibility)
Bubblewrap uses inquirer for all prompts. Piping stdin fails with `ERR_USE_AFTER_CLOSE` on Node.js v24 when multiple prompts are chained. **Fix: use `build-headless.js`** — a Node script that drives Bubblewrap's core APIs directly (TwaManifest, TwaGenerator, GradleWrapper, JarSigner) with no interactive prompts. Passwords are passed via env vars `BUBBLEWRAP_KEYSTORE_PASSWORD` / `BUBBLEWRAP_KEY_PASSWORD`.

## Pre-built config
Create `~/.bubblewrap/config.json` with `{"jdkPath": "/home/runner/jdk17", "androidSdkPath": "/home/runner/android-sdk"}` so Bubblewrap CLI skips JDK/SDK prompts.

## Build commands (from android-twa/)
```bash
export PATH="/home/runner/jdk17/bin:$HOME/.nix-profile/bin:$PATH"
export JAVA_HOME=/home/runner/jdk17
export ANDROID_HOME=/home/runner/android-sdk
./gradlew bundleRelease    # → app/build/outputs/bundle/release/app-release.aab
./gradlew assembleRelease  # → app/build/outputs/apk/release/app-release-unsigned.apk
# Then sign via build-headless.js or apksigner + jarsigner manually
```

**Why:** Gradle runs fine once the project is generated; only the Bubblewrap interactive layer is broken on Node v24.
