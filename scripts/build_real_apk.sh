#!/bin/bash
set -e

echo "========================================================="
echo "=== ANIMEBLACK OFFICIAL ANDROID APK BUILD ENGINE v2.5.0 =="
echo "========================================================="

BUILD_DIR="$(pwd)/android_build"
PUBLIC_DIR="$(pwd)/public"
ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
DX_TOOL="/usr/lib/android-sdk/build-tools/debian/dx"
AAPT2_TOOL="/usr/bin/aapt2"

mkdir -p "$PUBLIC_DIR"
LOG_FILE="$PUBLIC_DIR/apk_build.log"
exec > >(tee "$LOG_FILE") 2>&1

echo "Starting build process at $(date)"

# Clean previous build artifacts
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/src/com/animeblack/app"
mkdir -p "$BUILD_DIR/res/values"
mkdir -p "$BUILD_DIR/res/mipmap-mdpi"
mkdir -p "$BUILD_DIR/res/mipmap-hdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xxhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xxxhdpi"
mkdir -p "$BUILD_DIR/bin"
mkdir -p "$BUILD_DIR/gen"

# 1. Copy Application Icons across all densities
echo "--> [1/10] Preparing high-resolution app icons..."
if [ -f "$PUBLIC_DIR/icon-192.png" ]; then
    cp "$PUBLIC_DIR/icon-192.png" "$BUILD_DIR/res/mipmap-mdpi/ic_launcher.png"
    cp "$PUBLIC_DIR/icon-192.png" "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png"
    cp "$PUBLIC_DIR/icon-192.png" "$BUILD_DIR/res/mipmap-xhdpi/ic_launcher.png"
fi
if [ -f "$PUBLIC_DIR/icon-512.png" ]; then
    cp "$PUBLIC_DIR/icon-512.png" "$BUILD_DIR/res/mipmap-xxhdpi/ic_launcher.png"
    cp "$PUBLIC_DIR/icon-512.png" "$BUILD_DIR/res/mipmap-xxxhdpi/ic_launcher.png"
fi

# 2. Generate strings.xml
echo "--> [2/10] Generating Android application resources (strings.xml)..."
cat << 'EOF' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">AnimeBlack</string>
</resources>
EOF

# 3. Generate AndroidManifest.xml
echo "--> [3/10] Writing AndroidManifest.xml (minSdkVersion: 21, targetSdkVersion: 34)..."
cat << 'EOF' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.animeblack.app"
    android:versionCode="250"
    android:versionName="2.5.0">

    <uses-sdk
        android:minSdkVersion="21"
        android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">

        <activity
            android:name="com.animeblack.app.MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout|smallestScreenSize"
            android:exported="true"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# 4. Generate Java MainActivity source file
echo "--> [4/10] Writing Java MainActivity source file..."
cat << 'EOF' > "$BUILD_DIR/src/com/animeblack/app/MainActivity.java"
package com.animeblack.app;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.PermissionRequest;
import android.content.Intent;
import android.net.Uri;
import android.view.KeyEvent;
import android.graphics.Color;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private final static int FILECHOOSER_RESULTCODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#0A0A0C"));
        setContentView(webView);

        // Configure CookieManager for persistent Firebase Auth and User Sessions
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        settings.setUserAgentString(settings.getUserAgentString() + " AnimeBlackApp/2.5.0 Mobile");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    view.loadUrl(url);
                    return true;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            // Enable file chooser for avatar uploads, post images, and attachments
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    request.grant(request.getResources());
                }
            }
        });

        // Load application production live URL
        String targetUrl = "https://ais-pre-4we4l6lmtpdtxbryabuc6w-181517677265.europe-west2.run.app";
        webView.loadUrl(targetUrl);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (filePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                String dataString = data.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                } else if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                }
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
EOF

# 5. Compile resources using AAPT2
echo "--> [5/10] Compiling flat binary resources with AAPT2..."
"$AAPT2_TOOL" compile --dir "$BUILD_DIR/res" -o "$BUILD_DIR/compiled_res.zip"

echo "--> [6/10] Linking resources and AndroidManifest.xml into base APK..."
"$AAPT2_TOOL" link -o "$BUILD_DIR/bin/base.apk" \
    -I "$ANDROID_JAR" \
    --manifest "$BUILD_DIR/AndroidManifest.xml" \
    "$BUILD_DIR/compiled_res.zip" \
    --java "$BUILD_DIR/gen" \
    --auto-add-overlay

# 6. Compile Java source to bytecode
echo "--> [7/10] Compiling Java code to class files..."
javac -source 1.8 -target 1.8 \
    -d "$BUILD_DIR/bin" \
    -classpath "$ANDROID_JAR:$BUILD_DIR/gen" \
    "$BUILD_DIR/src/com/animeblack/app/MainActivity.java" \
    "$BUILD_DIR/gen/com/animeblack/app/R.java"

# 7. Convert bytecode to Dalvik Executable (classes.dex)
echo "--> [8/10] Converting bytecode to classes.dex using DX tool..."
"$DX_TOOL" --dex --output="$BUILD_DIR/bin/classes.dex" "$BUILD_DIR/bin"

# 8. Merge classes.dex and Web assets into APK archive
echo "--> [9/10] Bundling classes.dex and full application assets into APK package..."
mkdir -p "$BUILD_DIR/assets/www"
if [ -d "$(pwd)/dist" ]; then
    cp -r "$(pwd)/dist"/* "$BUILD_DIR/assets/www/" 2>/dev/null || true
fi
if [ -d "$PUBLIC_DIR" ]; then
    cp -r "$PUBLIC_DIR"/* "$BUILD_DIR/assets/www/" 2>/dev/null || true
fi

cd "$BUILD_DIR/bin"
zip -u base.apk classes.dex
cd "$BUILD_DIR"
zip -u -r "$BUILD_DIR/bin/base.apk" assets/
cd - > /dev/null

# 9. Align APK ZIP archive on 4-byte boundaries
echo "--> [10/10] Aligning ZIP archive with zipalign..."
zipalign -v -f 4 "$BUILD_DIR/bin/base.apk" "$BUILD_DIR/bin/aligned.apk"

# 10. Keystore & Signing
KEYSTORE="$BUILD_DIR/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
    echo "--> Generating RSA 2048 Debug Keystore..."
    keytool -genkeypair -v \
        -keystore "$KEYSTORE" \
        -alias androiddebugkey \
        -storepass android \
        -keypass android \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=AnimeBlack,OU=Dev,O=AnimeBlack,L=City,S=State,C=US"
fi

echo "--> Signing APK with apksigner (v1 + v2 + v3 scheme)..."
apksigner sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:android \
    --key-pass pass:android \
    --ks-key-alias androiddebugkey \
    --out "$BUILD_DIR/bin/AnimeBlack-signed.apk" \
    "$BUILD_DIR/bin/aligned.apk"

# 11. Rigorous Verification Step
echo "========================================================="
echo "=== VERIFYING APK INTEGRITY BEFORE PUBLISHING =========="
echo "========================================================="

# Verify signature
apksigner verify -v "$BUILD_DIR/bin/AnimeBlack-signed.apk"

# Verify classes.dex exists inside the apk
if ! unzip -l "$BUILD_DIR/bin/AnimeBlack-signed.apk" | grep -q "classes.dex"; then
    echo "ERROR: classes.dex is missing from APK package!"
    exit 1
fi

# Verify AndroidManifest.xml exists inside the apk
if ! unzip -l "$BUILD_DIR/bin/AnimeBlack-signed.apk" | grep -q "AndroidManifest.xml"; then
    echo "ERROR: AndroidManifest.xml is missing from APK package!"
    exit 1
fi

# Dump badging metadata
aapt2 dump badging "$BUILD_DIR/bin/AnimeBlack-signed.apk" | grep -E "package|sdkVersion|targetSdkVersion|application-label"

# Copy verified final APK to public release endpoints
cp "$BUILD_DIR/bin/AnimeBlack-signed.apk" "$PUBLIC_DIR/AnimeBlack.apk"
cp "$BUILD_DIR/bin/AnimeBlack-signed.apk" "$PUBLIC_DIR/AnimeBlack-v2.5.0.apk"
cp "$BUILD_DIR/bin/AnimeBlack-signed.apk" "$PUBLIC_DIR/AnimeBlack-v2.5.0-Release.apk"

echo "========================================================="
echo "=== BUILD SUCCESSFUL: REAL SIGNED APK PUBLISHED ========"
echo "Path: $PUBLIC_DIR/AnimeBlack.apk"
echo "Size: $(du -h "$PUBLIC_DIR/AnimeBlack.apk" | cut -f1)"
echo "========================================================="
