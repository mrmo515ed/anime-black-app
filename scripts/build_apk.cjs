#!/usr/bin/env node
/**
 * build_apk.cjs — Build the Anime Black APK with the REAL Android toolchain.
 *
 * Pipeline:
 *   1. aapt2  compile + link resources & manifest        (aaptjs3 npm pkg)
 *   2. apktool assemble smali -> classes.dex + package    (apktool.jar + JRE)
 *   3. sign v1 + v2 + v3                                  (apk_sign_ts npm pkg)
 *
 * The smali sources live in scripts/smali/ (translated from the original
 * MainActivity.java WebView shell). This produces a guaranteed-valid,
 * installable APK — no hand-written DEX.
 *
 * Required tools (auto-bootstrapped into .apk_tools/ if missing):
 *   - android.jar      (API 34)
 *   - javajre-linux-64 (bundled JRE/JDK from npm)
 *   - apktool-jar      (apktool.jar from npm)
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
  const cand = [process.env.ANDROID_JAR, path.join(TOOLS, 'android.jar')].filter(Boolean);
  for (const c of cand) if (fs.existsSync(c)) return c;
  throw new Error('android.jar not found. Place one at .apk_tools/android.jar');
}

function ensureTools() {
  const candidates = {
    javaBin: [
      path.join(TOOLS, 'javajre-linux-64', 'jre', 'bin', 'java'),
      path.join(TOOLS, 'node_modules', 'javajre-linux-64', 'jre', 'bin', 'java'),
    ],
    apktoolJar: [
      path.join(TOOLS, 'apktool-jar', 'bin', 'apktool_2.4.1.jar'),
      path.join(TOOLS, 'node_modules', 'apktool-jar', 'bin', 'apktool_2.4.1.jar'),
    ],
  };
  let javaBin = candidates.javaBin.find((p) => fs.existsSync(p));
  let apktoolJar = candidates.apktoolJar.find((p) => fs.existsSync(p));
  if (!javaBin || !apktoolJar) {
    console.log('--> Bootstrapping Java JRE + Apktool into .apk_tools (npm install)...');
    fs.mkdirSync(TOOLS, { recursive: true });
    sh('npm install --no-audit --no-fund --prefix .apk_tools javajre-linux-64 apktool-jar');
    javaBin = candidates.javaBin.find((p) => fs.existsSync(p));
    apktoolJar = candidates.apktoolJar.find((p) => fs.existsSync(p));
  }
  if (!javaBin || !apktoolJar) {
    throw new Error('Failed to bootstrap Java/Apktool into .apk_tools');
  }
  return { javaBin, apktoolJar };
}

async function main() {
  const AAPT2 = resolveAapt2();
  const ANDROID_JAR = resolveAndroidJar();
  const { javaBin, apktoolJar } = ensureTools();

  // Frontend
  if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
    console.log('--> dist/ not found, building frontend (npm run build)...');
    sh('npm run build');
  }

  // Signing key
  const keyPem = path.join(TOOLS, 'release_key.pem');
  const certPem = path.join(TOOLS, 'release_cert.pem');
  if (!fs.existsSync(keyPem) || !fs.existsSync(certPem)) {
    console.log('--> Generating signing key + certificate...');
    sh(`openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "${keyPem}"`);
    sh(`openssl req -new -x509 -key "${keyPem}" -out "${certPem}" -days 10000 -subj "/CN=Anime Black"`);
  }

  // Clean build dir
  fs.rmSync(BUILD, { recursive: true, force: true });
  fs.mkdirSync(path.join(BUILD, 'res', 'values'), { recursive: true });
  fs.mkdirSync(path.join(BUILD, 'res', 'mipmap'), { recursive: true });

  /* ---- resources + manifest (aapt2) ---- */
  fs.copyFileSync(path.join(ROOT, 'android_build', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png'),
    path.join(BUILD, 'res', 'mipmap', 'ic_launcher.png'));

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

  console.log('--> aapt2 compile + link (resources + manifest)...');
  sh(`"${AAPT2}" compile --dir "${path.join(BUILD, 'res')}" -o "${path.join(BUILD, 'compiled.zip')}"`);
  sh(`"${AAPT2}" link -o "${path.join(BUILD, 'base.apk')}" -I "${ANDROID_JAR}" --manifest "${path.join(BUILD, 'AndroidManifest.xml')}" "${path.join(BUILD, 'compiled.zip')}" --auto-add-overlay`);

  /* ---- apktool: decode, inject smali + assets, build ---- */
  const DECODED = path.join(BUILD, 'decoded');
  console.log('--> apktool: decode base.apk...');
  sh(`"${javaBin}" -jar "${apktoolJar}" d "${path.join(BUILD, 'base.apk')}" -o "${DECODED}" -f`);

  console.log('--> injecting smali sources...');
  sh(`cp -r "${path.join(ROOT, 'scripts', 'smali', 'com')}" "${path.join(DECODED, 'smali')}/"`);

  console.log('--> bundling web assets (dist -> assets/www)...');
  const www = path.join(DECODED, 'assets', 'www');
  fs.mkdirSync(www, { recursive: true });
  for (const f of fs.readdirSync(path.join(ROOT, 'dist'))) {
    if (/\.apk$/i.test(f) || f === 'server.cjs' || f === 'server.cjs.map') continue;
    fs.copyFileSync(path.join(ROOT, 'dist', f), path.join(www, f));
  }

  // store large web assets uncompressed so WebView can read them
  const yml = path.join(DECODED, 'apktool.yml');
  let ymlText = fs.readFileSync(yml, 'utf8');
  if (!/doNotCompress:/.test(ymlText)) {
    ymlText += '\ndoNotCompress:\n- resources.arsc\n- png\n';
  }
  for (const ext of ['html', 'js', 'css', 'webmanifest', 'json']) {
    if (!ymlText.includes(`- ${ext}`)) ymlText = ymlText.replace('doNotCompress:', `doNotCompress:\n- ${ext}`);
  }
  fs.writeFileSync(yml, ymlText);

  console.log('--> apktool: build (smali -> classes.dex -> APK)...');
  sh(`"${javaBin}" -jar "${apktoolJar}" b "${DECODED}" -o "${path.join(BUILD, 'unsigned.apk')}"`);

  /* ---- sign ---- */
  console.log('--> signing (v1 + v2 + v3)...');
  const { ApkSigner, SigningKey } = await import('apk_sign_ts');
  const privateKey = fs.readFileSync(keyPem, 'utf8');
  const certificate = fs.readFileSync(certPem, 'utf8');
  const signer = new ApkSigner({ signingKey: SigningKey.fromPEM(privateKey, certificate) });
  const unsigned = new Uint8Array(fs.readFileSync(path.join(BUILD, 'unsigned.apk')));
  const { signedApk } = await signer.sign(unsigned);
  const finalApk = Buffer.from(signedApk);

  /* ---- publish ---- */
  fs.mkdirSync(OUT, { recursive: true });
  const targets = ['AnimeBlack.apk', `AnimeBlack-v${VERSION_NAME}.apk`, `AnimeBlack-v${VERSION_NAME}-Release.apk`];
  for (const t of targets) fs.writeFileSync(path.join(OUT, t), finalApk);

  console.log('\n============================================================');
  console.log('BUILD SUCCESSFUL — real signed APK (apktool + smali)');
  console.log('Size: ' + (finalApk.length / 1024 / 1024).toFixed(2) + ' MB');
  for (const t of targets) console.log('  -> ' + path.join(OUT, t));
  console.log('============================================================');
}

main().catch((e) => {
  console.error('BUILD FAILED:', e.message);
  process.exit(1);
});
