/**
 * Headless Bubblewrap build — no interactive prompts.
 * Reads twa-manifest.json, generates the Android project, and runs the Gradle
 * release build, signing with the upload keystore.
 *
 * Usage (from android-twa/):
 *   BUBBLEWRAP_KEYSTORE_PASSWORD=<pass> node build-headless.js
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const {
  TwaManifest,
  TwaGenerator,
  Config,
  AndroidSdkTools,
  JdkHelper,
  GradleWrapper,
  JarSigner,
  ConsoleLog,
} = require('@bubblewrap/core');

const WORK_DIR   = __dirname;                     // android-twa/
const MANIFEST   = path.join(WORK_DIR, 'twa-manifest.json');
const APP_BUNDLE = path.join(WORK_DIR, 'app/build/outputs/bundle/release/app-release.aab');
const AAB_OUT    = path.join(WORK_DIR, 'app-release-bundle.aab');
const APK_UNSIGNED = path.join(WORK_DIR, 'app/build/outputs/apk/release/app-release-unsigned.apk');
const APK_ALIGNED  = path.join(WORK_DIR, 'app-release-unsigned-aligned.apk');
const APK_SIGNED   = path.join(WORK_DIR, 'app-release-signed.apk');

async function main() {
  const log = new ConsoleLog('fangirl-fc-build');

  // ── 1. Read passwords ────────────────────────────────────────────────────
  const ksPass = process.env.BUBBLEWRAP_KEYSTORE_PASSWORD;
  if (!ksPass) {
    throw new Error('Set BUBBLEWRAP_KEYSTORE_PASSWORD before running this script.');
  }
  const keyPass = process.env.BUBBLEWRAP_KEY_PASSWORD || ksPass;
  const passwords = { keystorePassword: ksPass, keyPassword: keyPass };

  // ── 2. Load manifest ─────────────────────────────────────────────────────
  log.info('Loading twa-manifest.json …');
  const twaManifest = await TwaManifest.fromFile(MANIFEST);

  // ── 3. Config (JDK + SDK) ────────────────────────────────────────────────
  const jdkPath = process.env.JAVA_HOME || '/home/runner/jdk17';
  const sdkPath = process.env.ANDROID_HOME || '/home/runner/android-sdk';
  const config  = new Config(jdkPath, sdkPath);

  const jdkHelper     = new JdkHelper(process, config);
  const androidSdk    = await AndroidSdkTools.create(process, config, jdkHelper, log);

  // ── 4. Generate Android project from manifest ────────────────────────────
  log.info('Generating Android project from twa-manifest.json …');
  const twaGenerator = new TwaGenerator();
  await twaGenerator.createTwaProject(WORK_DIR, twaManifest);
  log.info('Android project generated.');

  // ── 5. Install build-tools if missing ────────────────────────────────────
  if (!(await androidSdk.checkBuildTools())) {
    log.info('Installing build tools …');
    await androidSdk.installBuildTools();
  }

  // ── 6. Gradle release build ──────────────────────────────────────────────
  const gradleWrapper = new GradleWrapper(process, androidSdk, WORK_DIR);

  log.info('Running Gradle bundleRelease (AAB) …');
  await gradleWrapper.bundleRelease();
  log.info('AAB build complete.');

  log.info('Running Gradle assembleRelease (APK) …');
  await gradleWrapper.assembleRelease();
  log.info('APK build complete.');

  // ── 7. Sign AAB with jarsigner ───────────────────────────────────────────
  const signingKey = twaManifest.signingKey;
  const ksAbsPath  = path.resolve(WORK_DIR, signingKey.path);
  log.info(`Signing AAB with keystore ${ksAbsPath} …`);

  const jarSigner = new JarSigner(jdkHelper);
  await jarSigner.sign(
    { path: ksAbsPath, alias: signingKey.alias },
    `"${passwords.keystorePassword}"`,
    `"${passwords.keyPassword}"`,
    APP_BUNDLE,
    AAB_OUT,
  );
  log.info(`Signed AAB → ${AAB_OUT}`);

  // ── 8. Zipalign + sign APK ───────────────────────────────────────────────
  log.info('Zipaligning APK …');
  fs.copyFileSync(APK_UNSIGNED, APK_ALIGNED);
  await androidSdk.apksigner(
    ksAbsPath,
    `"${passwords.keystorePassword}"`,
    signingKey.alias,
    `"${passwords.keyPassword}"`,
    APK_ALIGNED,
    APK_SIGNED,
  );
  log.info(`Signed APK → ${APK_SIGNED}`);

  log.info('✓ Build complete!');
  log.info(`  AAB: ${AAB_OUT}`);
  log.info(`  APK: ${APK_SIGNED}`);
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
