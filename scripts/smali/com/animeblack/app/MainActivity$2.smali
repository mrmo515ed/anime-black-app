.class Lcom/animeblack/app/MainActivity$2;
.super Landroid/webkit/WebChromeClient;
.source "MainActivity.java"

.field final synthetic this$0:Lcom/animeblack/app/MainActivity;

.method constructor <init>(Lcom/animeblack/app/MainActivity;)V
    .registers 2
    iput-object p1, p0, Lcom/animeblack/app/MainActivity$2;->this$0:Lcom/animeblack/app/MainActivity;
    invoke-direct {p0}, Landroid/webkit/WebChromeClient;-><init>()V
    return-void
.end method

.method public onShowFileChooser(Landroid/webkit/WebView;Landroid/webkit/ValueCallback;Landroid/webkit/WebChromeClient$FileChooserParams;)Z
    .registers 8

    iget-object v0, p0, Lcom/animeblack/app/MainActivity$2;->this$0:Lcom/animeblack/app/MainActivity;

    iget-object v1, v0, Lcom/animeblack/app/MainActivity;->filePathCallback:Landroid/webkit/ValueCallback;
    if-eqz v1, :cond_0
    const/4 v2, 0x0
    invoke-interface {v1, v2}, Landroid/webkit/ValueCallback;->onReceiveValue(Ljava/lang/Object;)V

    :cond_0
    iput-object p2, v0, Lcom/animeblack/app/MainActivity;->filePathCallback:Landroid/webkit/ValueCallback;

    invoke-virtual {p3}, Landroid/webkit/WebChromeClient$FileChooserParams;->createIntent()Landroid/content/Intent;
    move-result-object v1

    const/16 v2, 0x3e9
    invoke-virtual {v0, v1, v2}, Landroid/app/Activity;->startActivityForResult(Landroid/content/Intent;I)V

    const/4 v2, 0x1
    return v2
.end method

.method public onPermissionRequest(Landroid/webkit/PermissionRequest;)V
    .registers 4

    invoke-virtual {p1}, Landroid/webkit/PermissionRequest;->getResources()[Ljava/lang/String;
    move-result-object v0
    invoke-virtual {p1, v0}, Landroid/webkit/PermissionRequest;->grant([Ljava/lang/String;)V
    return-void
.end method
