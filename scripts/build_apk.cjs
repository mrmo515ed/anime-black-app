#!/usr/bin/env node
/**
 * build_apk.cjs — Build a real, installable, signed APK for Anime Black.
 *
 * Pipeline (no Java / Android SDK required):
 *   1. Generate classes.dex            (scripts/gen_dex.cjs — hand-written DEX)
 *   2. aapt2 compile + link            (aaptjs3 npm package, native aapt2 binary)
 *   3. Bundle the built web app        (dist/ -> assets/www)
 *   4. Assemble the APK zip
 *   5. Sign v1 + v2 + v3               (apk_sign_ts npm package, pure JS)
 *
 * Requires:
 *   - npm install (aaptjs3, apk_sign_ts)
 *   - an android.jar (placed at .apk_tools/android.jar, gitignored)
 *   - a built frontend (npm run build)  — optional, will build if dist missing
 */
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, '.apk_build');
const TOOLS = path.join(ROOT, '.apk_tools');
const OUT = path.join(ROOT, 'public');

const PKG = 'com.animeblack.app';
const VERSION_NAME = '2.5.0';
const VERSION_CODE = '250';
const APP_LABEL = 'Anime Black | أنمي بلاك';
const START_URL = 'file:///android_asset/www/index.html';

function sh(cmd, cwd) {
  execSync(cmd, { stdio: 'inherit', cwd: cwd || ROOT });
}
function resolveAapt2() {
  const cand = [
    path.join(ROOT, 'node_modules', 'aaptjs3', 'bin', 'x64', 'linux', 'aapt2'),
    path.join(ROOT, 'node_modules', 'aaptjs3', 'bin', 'x64', 'darwin', 'aapt2'),
  ];
  for (const c of cand) if (fs.existsSync(c)) return c;
  throw new Error('aapt2 binary not found. Run: npm install');
}
function resolveAndroidJar() {
  const cand = [
    process.env.ANDROID_JAR,
    path.join(TOOLS, 'android.jar'),
    path.join(ROOT, '.android-sdk', 'android.jar'),
    '/tmp/android-platforms/android-34/android.jar',
  ].filter(Boolean);
  for (const c of cand) if (fs.existsSync(c)) return c;
  throw new Error('android.jar not found. Place one at .apk_tools/android.jar');
}

/* ------------------------------------------------------------------ *
 *  1. Ensure prerequisites
 * ------------------------------------------------------------------ */
async function main() {
  const AAPT2 = resolveAapt2();
  const ANDROID_JAR = resolveAndroidJar();

  // Frontend must be built
  if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
    console.log('--> dist/ not found, building frontend (npm run build)...');
    sh('npm run build');
  }

  // Signing key (persistent, gitignored)
  const keyPem = path.join(TOOLS, 'release_key.pem');
  const certPem = path.join(TOOLS, 'release_cert.pem');
  if (!fs.existsSync(keyPem) || !fs.existsSync(certPem)) {
    console.log('--> Generating signing key + self-signed certificate...');
    sh(`openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "${keyPem}"`);
    sh(`openssl req -new -x509 -key "${keyPem}" -out "${certPem}" -days 10000 -subj "/CN=Anime Black"`);
  }

  // Clean + prepare build dir
  fs.rmSync(BUILD, { recursive: true, force: true });
  fs.mkdirSync(path.join(BUILD, 'res', 'values'), { recursive: true });
  fs.mkdirSync(path.join(BUILD, 'res', 'mipmap'), { recursive: true });

  /* ------------------------------------------------------------------ *
   *  2. Resources + manifest
   * ------------------------------------------------------------------ */
  // launcher icon (use the committed regenerated icons)
  const iconSrc = path.join(ROOT, 'android_build', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png');
  fs.copyFileSync(iconSrc, path.join(BUILD, 'res', 'mipmap', 'ic_launcher.png'));

  fs.writeFileSync(path.join(BUILD, 'res', 'values', 'strings.xml'),
`<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${APP_LABEL}</string>
</resources>`);

  fs.writeFileSync(path.join(BUILD, 'AndroidManifest.xml'),
`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${PKG}"
    android:versionCode="${VERSION_CODE}"
    android:versionName="${VERSION_NAME}">
    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true">
        <activity
            android:name="${PKG}.MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout|smallestScreenSize|locale|layoutDirection"
            android:windowSoftInputMode="adjustResize"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`);

  /* ------------------------------------------------------------------ *
   *  3. classes.dex
   * ------------------------------------------------------------------ */
  console.log('--> Generating classes.dex...');
  const { buildDex } = require('./gen_dex.cjs');
  const dex = buildDex();
  fs.writeFileSync(path.join(BUILD, 'classes.dex'), dex);

  /* ------------------------------------------------------------------ *
   *  4. aapt2 compile + link
   * ------------------------------------------------------------------ */
  console.log('--> Compiling resources (aapt2 compile)...');
  sh(`"${AAPT2}" compile --dir "${path.join(BUILD, 'res')}" -o "${path.join(BUILD, 'compiled.zip')}"`);
  console.log('--> Linking resources + manifest (aapt2 link)...');
  sh(`"${AAPT2}" link -o "${path.join(BUILD, 'base.apk')}" -I "${ANDROID_JAR}" --manifest "${path.join(BUILD, 'AndroidManifest.xml')}" "${path.join(BUILD, 'compiled.zip')}" --auto-add-overlay`);

  /* ------------------------------------------------------------------ *
   *  5. Bundle web assets
   * ------------------------------------------------------------------ */
  console.log('--> Bundling web assets (dist -> assets/www)...');
  const www = path.join(BUILD, 'assets', 'www');
  fs.mkdirSync(www, { recursive: true });
  for (const f of fs.readdirSync(path.join(ROOT, 'dist'))) {
    // skip the node server bundle + the APKs themselves
    if (/\.apk$/i.test(f) || f === 'server.cjs' || f === 'server.cjs.map') continue;
    fs.copyFileSync(path.join(ROOT, 'dist', f), path.join(www, f));
  }

  // assemble
  console.log('--> Adding classes.dex + assets to APK...');
  sh(`zip -q -0 "${path.join(BUILD, 'base.apk')}" classes.dex`, BUILD);
  sh(`zip -q -r "${path.join(BUILD, 'base.apk')}" assets`, BUILD);

  /* ------------------------------------------------------------------ *
   *  6. Sign (v1 + v2 + v3)
   * ------------------------------------------------------------------ */
  console.log('--> Signing APK (v1 + v2 + v3)...');
  const { ApkSigner, SigningKey } = await import('apk_sign_ts');
  const privateKey = fs.readFileSync(keyPem, 'utf8');
  const certificate = fs.readFileSync(certPem, 'utf8');
  const signer = new ApkSigner({ signingKey: SigningKey.fromPEM(privateKey, certificate) });
  const unsigned = new Uint8Array(fs.readFileSync(path.join(BUILD, 'base.apk')));
  const { signedApk } = await signer.sign(unsigned);
  const finalApk = Buffer.from(signedApk);

  /* ------------------------------------------------------------------ *
   *  7. Publish
   * ------------------------------------------------------------------ */
  fs.mkdirSync(OUT, { recursive: true });
  const targets = ['AnimeBlack.apk', `AnimeBlack-v${VERSION_NAME}.apk`, `AnimeBlack-v${VERSION_NAME}-Release.apk`];
  for (const t of targets) fs.writeFileSync(path.join(OUT, t), finalApk);

  console.log('\n============================================================');
  console.log('BUILD SUCCESSFUL — real, signed APK published');
  console.log('Size: ' + (finalApk.length / 1024 / 1024).toFixed(2) + ' MB');
  for (const t of targets) console.log('  -> ' + path.join(OUT, t));
  console.log('============================================================');
}

main().catch((e) => {
  console.error('BUILD FAILED:', e.message);
  process.exit(1);
});
