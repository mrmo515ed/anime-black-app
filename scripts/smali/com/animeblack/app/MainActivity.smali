.class public Lcom/animeblack/app/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"

.field webView:Landroid/webkit/WebView;
.field filePathCallback:Landroid/webkit/ValueCallback;

.method public constructor <init>()V
    .registers 1
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V
    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .registers 5

    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    new-instance v0, Landroid/webkit/WebView;
    invoke-direct {v0, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
    iput-object v0, p0, Lcom/animeblack/app/MainActivity;->webView:Landroid/webkit/WebView;

    const-string v1, "#0A0A0C"
    invoke-static {v1}, Landroid/graphics/Color;->parseColor(Ljava/lang/String;)I
    move-result v1
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setBackgroundColor(I)V

    invoke-virtual {p0, v0}, Landroid/app/Activity;->setContentView(Landroid/view/View;)V

    invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
    move-result-object v1

    const/4 v2, 0x1
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDatabaseEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowFileAccess(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowContentAccess(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setLoadWithOverviewMode(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setUseWideViewPort(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptCanOpenWindowsAutomatically(Z)V

    const/4 v2, 0x0
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setSupportZoom(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setBuiltInZoomControls(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDisplayZoomControls(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setMediaPlaybackRequiresUserGesture(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setMixedContentMode(I)V

    new-instance v1, Lcom/animeblack/app/MainActivity$1;
    invoke-direct {v1, p0}, Lcom/animeblack/app/MainActivity$1;-><init>(Lcom/animeblack/app/MainActivity;)V
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V

    new-instance v1, Lcom/animeblack/app/MainActivity$2;
    invoke-direct {v1, p0}, Lcom/animeblack/app/MainActivity$2;-><init>(Lcom/animeblack/app/MainActivity;)V
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setWebChromeClient(Landroid/webkit/WebChromeClient;)V

    const-string v1, "file:///android_asset/www/index.html"
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V

    return-void
.end method

.method public onKeyDown(ILandroid/view/KeyEvent;)Z
    .registers 5

    const/4 v0, 0x4
    if-ne p1, v0, :cond_super

    iget-object v0, p0, Lcom/animeblack/app/MainActivity;->webView:Landroid/webkit/WebView;
    if-eqz v0, :cond_super

    invoke-virtual {v0}, Landroid/webkit/WebView;->canGoBack()Z
    move-result v1
    if-eqz v1, :cond_super

    invoke-virtual {v0}, Landroid/webkit/WebView;->goBack()V
    const/4 v0, 0x1
    return v0

    :cond_super
    invoke-super {p0, p1, p2}, Landroid/app/Activity;->onKeyDown(ILandroid/view/KeyEvent;)Z
    move-result v0
    return v0
.end method

.method protected onActivityResult(IILandroid/content/Intent;)V
    .registers 9

    invoke-super {p0, p1, p2, p3}, Landroid/app/Activity;->onActivityResult(IILandroid/content/Intent;)V

    const/16 v0, 0x3e9
    if-ne p1, v0, :cond_end

    iget-object v1, p0, Lcom/animeblack/app/MainActivity;->filePathCallback:Landroid/webkit/ValueCallback;
    if-eqz v1, :cond_end

    const/4 v2, 0x0
    const/4 v3, -0x1
    if-ne p2, v3, :cond_skip
    if-eqz p3, :cond_skip

    invoke-virtual {p3}, Landroid/content/Intent;->getDataString()Ljava/lang/String;
    move-result-object v4
    if-eqz v4, :cond_skip

    const/4 v3, 0x1
    new-array v2, v3, [Landroid/net/Uri;
    invoke-static {v4}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;
    move-result-object v4
    const/4 v3, 0x0
    aput-object v4, v2, v3

    :cond_skip
    invoke-interface {v1, v2}, Landroid/webkit/ValueCallback;->onReceiveValue(Ljava/lang/Object;)V
    const/4 v3, 0x0
    iput-object v3, p0, Lcom/animeblack/app/MainActivity;->filePathCallback:Landroid/webkit/ValueCallback;

    :cond_end
    return-void
.end method

.method protected onDestroy()V
    .registers 2

    iget-object v0, p0, Lcom/animeblack/app/MainActivity;->webView:Landroid/webkit/WebView;
    if-eqz v0, :cond_0
    invoke-virtual {v0}, Landroid/webkit/WebView;->destroy()V

    :cond_0
    invoke-super {p0}, Landroid/app/Activity;->onDestroy()V
    return-void
.end method
