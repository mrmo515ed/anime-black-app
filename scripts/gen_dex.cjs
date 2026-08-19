#!/usr/bin/env node
/**
 * gen_dex.cjs — Generate a valid classes.dex (Dalvik bytecode, DEX 035)
 * for the AnimeBlack WebView shell WITHOUT Java / Android SDK.
 *
 * Classes produced:
 *   com.animeblack.app.MainActivity      — Activity hosting a WebView
 *   com.animeblack.app.MainActivity$1    — WebViewClient
 *   com.animeblack.app.MainActivity$2    — WebChromeClient (file chooser / permissions / alerts)
 *
 * The WebView loads file:///android_asset/www/index.html (the bundled app).
 */
'use strict';

const fs = require('fs');
const crypto = require('crypto');

/* ------------------------------------------------------------------ *
 *  Encoders
 * ------------------------------------------------------------------ */
function uleb128(value) {
  if (!Number.isInteger(value) || value < 0) throw new Error('bad uleb ' + value);
  const out = [];
  let v = value >>> 0;
  do {
    let b = v & 0x7f;
    v >>>= 7;
    if (v !== 0) b |= 0x80;
    out.push(b);
  } while (v !== 0);
  return Buffer.from(out);
}

/** MUTF-8 encode (dex string data). */
function mutf8(str) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.codePointAt(i);
    if (c > 0xffff) {
      c -= 0x10000;
      const hi = 0xd800 + (c >> 10);
      const lo = 0xdc00 + (c & 0x3ff);
      out.push(0xed, 0xa0 + (hi >> 6), 0x80 + (hi & 0x3f));
      out.push(0xed, 0xb0 + (lo >> 6), 0x80 + (lo & 0x3f));
      i++;
    } else if (c === 0) {
      out.push(0xc0, 0x80);
    } else if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return Buffer.from(out);
}

function shortyOf(ret, params) {
  const prim = { V: 'V', Z: 'Z', B: 'B', S: 'S', C: 'C', I: 'I', J: 'J', F: 'F', D: 'D' };
  return ret + params.map((p) => (p.startsWith('L') || p.startsWith('[') ? 'L' : prim[p] || 'L')).join('');
}

/* ------------------------------------------------------------------ *
 *  Registry
 * ------------------------------------------------------------------ */
const CLASS_METHODS = {};
function M(cls, name, ret, params) {
  const key = cls + '->' + name + '(' + params.join('') + ')' + ret;
  if (!CLASS_METHODS[cls]) CLASS_METHODS[cls] = [];
  if (!CLASS_METHODS[cls].some((m) => m.key === key)) {
    CLASS_METHODS[cls].push({ key, cls, name, ret, params });
  }
  return key;
}

const MA = 'Lcom/animeblack/app/MainActivity;';
const M1 = 'Lcom/animeblack/app/MainActivity$1;';
const M2 = 'Lcom/animeblack/app/MainActivity$2;';
const Activity = 'Landroid/app/Activity;';
const WebView = 'Landroid/webkit/WebView;';
const WebSettings = 'Landroid/webkit/WebSettings;';
const WebViewClient = 'Landroid/webkit/WebViewClient;';
const WebChromeClient = 'Landroid/webkit/WebChromeClient;';
const FileChooserParams = 'Landroid/webkit/WebChromeClient$FileChooserParams;';
const ValueCallback = 'Landroid/webkit/ValueCallback;';
const PermissionRequest = 'Landroid/webkit/PermissionRequest;';
const JsResult = 'Landroid/webkit/JsResult;';
const Context = 'Landroid/content/Context;';
const Intent = 'Landroid/content/Intent;';
const Uri = 'Landroid/net/Uri;';
const Bundle = 'Landroid/os/Bundle;';
const KeyEvent = 'Landroid/view/KeyEvent;';
const View = 'Landroid/view/View;';
const Color = 'Landroid/graphics/Color;';
const AlertBuilder = 'Landroid/app/AlertDialog$Builder;';
const AlertDialog = 'Landroid/app/AlertDialog;';
const CharSequence = 'Ljava/lang/CharSequence;';
const OnClickListener = 'Landroid/content/DialogInterface$OnClickListener;';
const ObjectT = 'Ljava/lang/Object;';
const StringT = 'Ljava/lang/String;';
const UriArray = '[Landroid/net/Uri;';
const StringArray = '[Ljava/lang/String;';

// MainActivity
M(MA, '<init>', 'V', []);
M(MA, 'onCreate', 'V', [Bundle]);
M(MA, 'onActivityResult', 'V', ['I', 'I', Intent]);
M(MA, 'onKeyDown', 'Z', ['I', KeyEvent]);
M(MA, 'onDestroy', 'V', []);
// Activity
M(Activity, '<init>', 'V', []);
M(Activity, 'onCreate', 'V', [Bundle]);
M(Activity, 'onActivityResult', 'V', ['I', 'I', Intent]);
M(Activity, 'onKeyDown', 'Z', ['I', KeyEvent]);
M(Activity, 'onDestroy', 'V', []);
M(Activity, 'setContentView', 'V', [View]);
M(Activity, 'startActivityForResult', 'V', [Intent, 'I']);
// WebView
M(WebView, '<init>', 'V', [Context]);
M(WebView, 'getSettings', WebSettings, []);
M(WebView, 'setBackgroundColor', 'V', ['I']);
M(WebView, 'setWebViewClient', 'V', [WebViewClient]);
M(WebView, 'setWebChromeClient', 'V', [WebChromeClient]);
M(WebView, 'loadUrl', 'V', [StringT]);
M(WebView, 'canGoBack', 'Z', []);
M(WebView, 'goBack', 'V', []);
M(WebView, 'destroy', 'V', []);
// WebSettings
M(WebSettings, 'setJavaScriptEnabled', 'V', ['Z']);
M(WebSettings, 'setDomStorageEnabled', 'V', ['Z']);
M(WebSettings, 'setDatabaseEnabled', 'V', ['Z']);
M(WebSettings, 'setAllowFileAccess', 'V', ['Z']);
M(WebSettings, 'setAllowContentAccess', 'V', ['Z']);
M(WebSettings, 'setLoadWithOverviewMode', 'V', ['Z']);
M(WebSettings, 'setUseWideViewPort', 'V', ['Z']);
M(WebSettings, 'setSupportZoom', 'V', ['Z']);
M(WebSettings, 'setBuiltInZoomControls', 'V', ['Z']);
M(WebSettings, 'setDisplayZoomControls', 'V', ['Z']);
M(WebSettings, 'setJavaScriptCanOpenWindowsAutomatically', 'V', ['Z']);
M(WebSettings, 'setMediaPlaybackRequiresUserGesture', 'V', ['Z']);
M(WebSettings, 'setMixedContentMode', 'V', ['I']);
// Color
M(Color, 'parseColor', 'I', [StringT]);
// WebViewClient
M(WebViewClient, '<init>', 'V', []);
// MainActivity$1
M(M1, '<init>', 'V', [MA]);
M(M1, 'shouldOverrideUrlLoading', 'Z', [WebView, StringT]);
// WebChromeClient
M(WebChromeClient, '<init>', 'V', []);
// MainActivity$2
M(M2, '<init>', 'V', [MA]);
M(M2, 'onShowFileChooser', 'Z', [WebView, ValueCallback, FileChooserParams]);
M(M2, 'onPermissionRequest', 'V', [PermissionRequest]);
M(M2, 'onJsAlert', 'Z', [WebView, StringT, StringT, JsResult]);
// ValueCallback
M(ValueCallback, 'onReceiveValue', 'V', [ObjectT]);
// FileChooserParams
M(FileChooserParams, 'createIntent', Intent, []);
// PermissionRequest
M(PermissionRequest, 'getResources', StringArray, []);
M(PermissionRequest, 'grant', 'V', [StringArray]);
// Intent
M(Intent, 'getDataString', StringT, []);
// Uri
M(Uri, 'parse', Uri, [StringT]);
// AlertDialog.Builder
M(AlertBuilder, '<init>', 'V', [Context]);
M(AlertBuilder, 'setMessage', AlertBuilder, [CharSequence]);
M(AlertBuilder, 'setPositiveButton', AlertBuilder, [CharSequence, OnClickListener]);
M(AlertBuilder, 'show', AlertDialog, []);

const FIELDS = [
  { cls: MA, name: 'webView', type: WebView },
  { cls: MA, name: 'filePathCallback', type: ValueCallback },
  { cls: M1, name: 'this$0', type: MA },
  { cls: M2, name: 'this$0', type: MA },
];

const CLASS_DEFS = [
  {
    cls: MA, super: Activity, access: 0x0001, source: 'MainActivity.java',
    instanceFields: ['webView', 'filePathCallback'],
    direct: [
      { method: MA + '-><init>()V', access: 0x10001 },
      { method: MA + '->onCreate(' + Bundle + ')V', access: 0x0004 },
      { method: MA + '->onActivityResult(' + 'I' + 'I' + Intent + ')V', access: 0x0004 },
      { method: MA + '->onDestroy()V', access: 0x0004 },
    ],
    virtual: [
      { method: MA + '->onKeyDown(' + 'I' + KeyEvent + ')Z', access: 0x0001 },
    ],
  },
  {
    cls: M1, super: WebViewClient, access: 0x0000, source: 'MainActivity$1.java',
    instanceFields: ['this$0'],
    direct: [{ method: M1 + '-><init>(' + MA + ')V', access: 0x10000 }],
    virtual: [{ method: M1 + '->shouldOverrideUrlLoading(' + WebView + StringT + ')Z', access: 0x0001 }],
  },
  {
    cls: M2, super: WebChromeClient, access: 0x0000, source: 'MainActivity$2.java',
    instanceFields: ['this$0'],
    direct: [{ method: M2 + '-><init>(' + MA + ')V', access: 0x10000 }],
    virtual: [
      { method: M2 + '->onShowFileChooser(' + WebView + ValueCallback + FileChooserParams + ')Z', access: 0x0001 },
      { method: M2 + '->onPermissionRequest(' + PermissionRequest + ')V', access: 0x0001 },
      { method: M2 + '->onJsAlert(' + WebView + StringT + StringT + JsResult + ')Z', access: 0x0001 },
    ],
  },
];

/* ------------------------------------------------------------------ *
 *  Symbolic assembler
 * ------------------------------------------------------------------ */
const OPS = {
  'move-result': 0x0a,
  'move-result-object': 0x0c,
  'return-void': 0x0e,
  'return': 0x0f,
  'const/4': 0x12,
  'const/16': 0x13,
  'const-string': 0x1a,
  'new-instance': 0x22,
  'new-array': 0x23,
  'if-eq': 0x32,
  'if-ne': 0x33,
  'if-eqz': 0x38,
  'if-nez': 0x39,
  'aput-object': 0x4d,
  'iget-object': 0x54,
  'iput-object': 0x5b,
  'invoke-virtual': 0x6e,
  'invoke-super': 0x6f,
  'invoke-direct': 0x70,
  'invoke-static': 0x71,
  'invoke-interface': 0x72,
};
const I = (op, ...args) => ({ op, args, label: null });
const L = (name) => ({ op: null, args: [], label: name });

const bodies = {};

function defineBodies() {
  bodies[MA + '-><init>()V'] = {
    regs: 1, ins: 1,
    code: [
      I('invoke-direct', [0], Activity + '-><init>()V'),
      I('return-void'),
    ],
  };

  // p0=this p1=bundle | v2=webView v3=settings v4=temp
  bodies[MA + '->onCreate(' + Bundle + ')V'] = {
    regs: 5, ins: 2,
    code: [
      I('invoke-super', [0, 1], Activity + '->onCreate(' + Bundle + ')V'),
      I('new-instance', 2, WebView),
      I('invoke-direct', [2, 0], WebView + '-><init>(' + Context + ')V'),
      I('const-string', 4, '#0A0A0C'),
      I('invoke-static', [4], Color + '->parseColor(' + StringT + ')I'),
      I('move-result', 4),
      I('invoke-virtual', [2, 4], WebView + '->setBackgroundColor(' + 'I' + ')V'),
      I('invoke-virtual', [0, 2], Activity + '->setContentView(' + View + ')V'),
      I('invoke-virtual', [2], WebView + '->getSettings()' + WebSettings),
      I('move-result-object', 3),
      I('const/4', 4, 1),
      I('invoke-virtual', [3, 4], WebSettings + '->setJavaScriptEnabled(' + 'Z' + ')V'),
      I('invoke-virtual', [3, 4], WebSettings + '->setDomStorageEnabled(' + 'Z' + ')V'),
      I('invoke-virtual', [3, 4], WebSettings + '->setDatabaseEnabled(' + 'Z' + ')V'),
      I('invoke-virtual', [3, 4], WebSettings + '->setAllowFileAccess(' + 'Z' + ')V'),
      I('invoke-virtual', [3, 4], WebSettings + '->setAllowContentAccess(' + 'Z' + ')V'),
      I('invoke-virtual', [3, 4], WebSettings + '->setLoadWithOverviewMode(' + 'Z' + ')V'),
      I('invoke-virtual', [3, 4], WebSettings + '->setUseWideViewPort(' + 'Z' + ')V'),
      I('const/4', 4, 0),
      I('invoke-virtual', [3, 4], WebSettings + '->setSupportZoom(' + 'Z' + ')V'),
      I('invoke-virtual', [3, 4], WebSettings + '->setBuiltInZoomControls(' + 'Z' + ')V'),
      I('invoke-virtual', [3, 4], WebSettings + '->setDisplayZoomControls(' + 'Z' + ')V'),
      I('const/4', 4, 1),
      I('invoke-virtual', [3, 4], WebSettings + '->setJavaScriptCanOpenWindowsAutomatically(' + 'Z' + ')V'),
      I('const/4', 4, 0),
      I('invoke-virtual', [3, 4], WebSettings + '->setMediaPlaybackRequiresUserGesture(' + 'Z' + ')V'),
      I('invoke-virtual', [3, 4], WebSettings + '->setMixedContentMode(' + 'I' + ')V'),
      I('iput-object', 2, 0, MA + '->webView:' + WebView),
      I('new-instance', 4, M1),
      I('invoke-direct', [4, 0], M1 + '-><init>(' + MA + ')V'),
      I('invoke-virtual', [2, 4], WebView + '->setWebViewClient(' + WebViewClient + ')V'),
      I('new-instance', 4, M2),
      I('invoke-direct', [4, 0], M2 + '-><init>(' + MA + ')V'),
      I('invoke-virtual', [2, 4], WebView + '->setWebChromeClient(' + WebChromeClient + ')V'),
      I('const-string', 4, 'file:///android_asset/www/index.html'),
      I('invoke-virtual', [2, 4], WebView + '->loadUrl(' + StringT + ')V'),
      I('return-void'),
    ],
  };

  // p0=this p1=requestCode p2=resultCode p3=data | v4..v7 locals
  bodies[MA + '->onActivityResult(' + 'I' + 'I' + Intent + ')V'] = {
    regs: 8, ins: 4,
    code: [
      I('invoke-super', [0, 1, 2, 3], Activity + '->onActivityResult(' + 'I' + 'I' + Intent + ')V'),
      I('const/16', 4, 1001),
      I('if-ne', 1, 4, 'end'),
      I('iget-object', 5, 0, MA + '->filePathCallback:' + ValueCallback),
      I('if-eqz', 5, 'end'),
      I('const/4', 6, 0),
      I('const/4', 7, -1),
      I('if-ne', 2, 7, 'skip'),
      I('if-eqz', 3, 'skip'),
      I('invoke-virtual', [3], Intent + '->getDataString()' + StringT),
      I('move-result-object', 7),
      I('if-eqz', 7, 'skip'),
      I('const/4', 4, 1),
      I('new-array', 6, 4, UriArray),
      I('invoke-static', [7], Uri + '->parse(' + StringT + ')' + Uri),
      I('move-result-object', 7),
      I('const/4', 4, 0),
      I('aput-object', 7, 6, 4),
      L('skip'),
      I('invoke-interface', [5, 6], ValueCallback + '->onReceiveValue(' + ObjectT + ')V'),
      I('const/4', 4, 0),
      I('iput-object', 4, 0, MA + '->filePathCallback:' + ValueCallback),
      L('end'),
      I('return-void'),
    ],
  };

  // p0=this p1=keyCode p2=event | v3,v4 locals
  bodies[MA + '->onKeyDown(' + 'I' + KeyEvent + ')Z'] = {
    regs: 5, ins: 3,
    code: [
      I('const/4', 3, 4),
      I('if-ne', 1, 3, 'call_super'),
      I('iget-object', 3, 0, MA + '->webView:' + WebView),
      I('if-eqz', 3, 'call_super'),
      I('invoke-virtual', [3], WebView + '->canGoBack()Z'),
      I('move-result', 4),
      I('if-eqz', 4, 'call_super'),
      I('invoke-virtual', [3], WebView + '->goBack()V'),
      I('const/4', 3, 1),
      I('return', 3),
      L('call_super'),
      I('invoke-super', [0, 1, 2], Activity + '->onKeyDown(' + 'I' + KeyEvent + ')Z'),
      I('move-result', 3),
      I('return', 3),
    ],
  };

  bodies[MA + '->onDestroy()V'] = {
    regs: 2, ins: 1,
    code: [
      I('iget-object', 1, 0, MA + '->webView:' + WebView),
      I('if-eqz', 1, 'skip'),
      I('invoke-virtual', [1], WebView + '->destroy()V'),
      L('skip'),
      I('invoke-super', [0], Activity + '->onDestroy()V'),
      I('return-void'),
    ],
  };

  bodies[M1 + '-><init>(' + MA + ')V'] = {
    regs: 2, ins: 2,
    code: [
      I('iput-object', 1, 0, M1 + '->this$0:' + MA),
      I('invoke-direct', [0], WebViewClient + '-><init>()V'),
      I('return-void'),
    ],
  };

  bodies[M1 + '->shouldOverrideUrlLoading(' + WebView + StringT + ')Z'] = {
    regs: 3, ins: 3,
    code: [
      I('const/4', 0, 0),
      I('return', 0),
    ],
  };

  bodies[M2 + '-><init>(' + MA + ')V'] = {
    regs: 2, ins: 2,
    code: [
      I('iput-object', 1, 0, M2 + '->this$0:' + MA),
      I('invoke-direct', [0], WebChromeClient + '-><init>()V'),
      I('return-void'),
    ],
  };

  // p0=this p1=webView p2=cb p3=params | v4=outer v5=temp v6=temp v7=temp
  bodies[M2 + '->onShowFileChooser(' + WebView + ValueCallback + FileChooserParams + ')Z'] = {
    regs: 8, ins: 4,
    code: [
      I('iget-object', 4, 0, M2 + '->this$0:' + MA),
      I('iget-object', 5, 4, MA + '->filePathCallback:' + ValueCallback),
      I('if-eqz', 5, 'nocb'),
      I('const/4', 6, 0),
      I('invoke-interface', [5, 6], ValueCallback + '->onReceiveValue(' + ObjectT + ')V'),
      L('nocb'),
      I('iput-object', 2, 4, MA + '->filePathCallback:' + ValueCallback),
      I('invoke-virtual', [3], FileChooserParams + '->createIntent()' + Intent),
      I('move-result-object', 5),
      I('const/16', 6, 1001),
      I('invoke-virtual', [4, 5, 6], Activity + '->startActivityForResult(' + Intent + 'I' + ')V'),
      I('const/4', 7, 1),
      I('return', 7),
    ],
  };

  bodies[M2 + '->onPermissionRequest(' + PermissionRequest + ')V'] = {
    regs: 3, ins: 2,
    code: [
      I('invoke-virtual', [1], PermissionRequest + '->getResources()' + StringArray),
      I('move-result-object', 2),
      I('invoke-virtual', [1, 2], PermissionRequest + '->grant(' + StringArray + ')V'),
      I('return-void'),
    ],
  };

  // p0=this p1=view p2=url p3=message p4=result | v5=builder
  bodies[M2 + '->onJsAlert(' + WebView + StringT + StringT + JsResult + ')Z'] = {
    regs: 6, ins: 5,
    code: [
      I('new-instance', 5, AlertBuilder),
      I('invoke-direct', [5, 1], AlertBuilder + '-><init>(' + Context + ')V'),
      I('invoke-virtual', [5, 3], AlertBuilder + '->setMessage(' + CharSequence + ')' + AlertBuilder),
      I('const-string', 0, 'OK'),
      I('const/4', 1, 0),
      I('invoke-virtual', [5, 0, 1], AlertBuilder + '->setPositiveButton(' + CharSequence + OnClickListener + ')' + AlertBuilder),
      I('invoke-virtual', [5], AlertBuilder + '->show()' + AlertDialog),
      I('const/4', 0, 1),
      I('return', 0),
    ],
  };
}
defineBodies();

/* ------------------------------------------------------------------ *
 *  Build tables
 * ------------------------------------------------------------------ */
const stringSet = new Set();
for (const cls of Object.keys(CLASS_METHODS)) {
  stringSet.add(cls);
  for (const m of CLASS_METHODS[cls]) {
    stringSet.add(m.name);
    for (const p of m.params) stringSet.add(p);
    stringSet.add(m.ret);
  }
}
for (const f of FIELDS) { stringSet.add(f.cls); stringSet.add(f.name); stringSet.add(f.type); }
for (const cd of CLASS_DEFS) stringSet.add(cd.source);
stringSet.add('#0A0A0C');
stringSet.add('file:///android_asset/www/index.html');
stringSet.add('OK');

// add all shorty strings (proto shorties)
for (const cls of Object.keys(CLASS_METHODS)) {
  for (const m of CLASS_METHODS[cls]) stringSet.add(shortyOf(m.ret, m.params));
}

// ensure instruction-referenced array types exist in the string pool
stringSet.add(UriArray);
stringSet.add(StringArray);

const strings = Array.from(stringSet).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const stringIndex = new Map(strings.map((s, i) => [s, i]));

// a valid type descriptor: single primitive char, 'L...;', or '[+...'
function isTypeDesc(s) {
  if (/^[VZBCSIJFD]$/.test(s)) return true;
  if (/^L[^;]*;$/.test(s)) return true;
  if (/^\[+[VZBCSIJFD]/.test(s)) return true;
  if (/^\[+L[^;]*;$/.test(s)) return true;
  return false;
}
const typeSet = new Set();
for (const s of strings) if (isTypeDesc(s)) typeSet.add(s);
const types = Array.from(typeSet).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const typeIndex = new Map(types.map((t, i) => [t, i]));

const protoSet = new Map();
for (const cls of Object.keys(CLASS_METHODS)) {
  for (const m of CLASS_METHODS[cls]) {
    const k = m.ret + '|' + m.params.join(',');
    if (!protoSet.has(k)) protoSet.set(k, { ret: m.ret, params: m.params.slice() });
  }
}
const protoList = Array.from(protoSet.values());
protoList.sort((a, b) => {
  if (a.ret !== b.ret) return a.ret < b.ret ? -1 : 1;
  const ap = a.params.join(','), bp = b.params.join(',');
  return ap < bp ? -1 : ap > bp ? 1 : 0;
});
const protoIndex = new Map(protoList.map((p, i) => [p.ret + '|' + p.params.join(','), i]));

const methodList = [];
for (const cls of Object.keys(CLASS_METHODS)) for (const m of CLASS_METHODS[cls]) methodList.push(m);
methodList.sort((a, b) => {
  const ai = typeIndex.get(a.cls), bi = typeIndex.get(b.cls);
  if (ai !== bi) return ai - bi;
  const an = stringIndex.get(a.name), bn = stringIndex.get(b.name);
  if (an !== bn) return an - bn;
  const ap = protoIndex.get(a.ret + '|' + a.params.join(','));
  const bp = protoIndex.get(b.ret + '|' + b.params.join(','));
  return ap - bp;
});
const methodIndex = new Map(methodList.map((m, i) => [m.key, i]));

FIELDS.sort((a, b) => {
  const ai = typeIndex.get(a.cls), bi = typeIndex.get(b.cls);
  if (ai !== bi) return ai - bi;
  const an = stringIndex.get(a.name), bn = stringIndex.get(b.name);
  if (an !== bn) return an - bn;
  return typeIndex.get(a.type) - typeIndex.get(b.type);
});
const fieldIndex = new Map(FIELDS.map((f, i) => [f.cls + '->' + f.name + ':' + f.type, i]));

/* ------------------------------------------------------------------ *
 *  Byte-level instruction encoding
 * ------------------------------------------------------------------ */
function u16le(v) { return [v & 0xff, (v >> 8) & 0xff]; }

function encodeInstruction(insn) {
  const op = OPS[insn.op];
  const a = insn.args;
  const b = [];
  const push16 = (v) => b.push(v & 0xff, (v >> 8) & 0xff);
  switch (insn.op) {
    case 'return-void': b.push(op, 0x00); break;
    case 'move-result':
    case 'move-result-object':
    case 'return': b.push(op, a[0] & 0xff); break;
    case 'const/4': b.push(op, (((a[1] & 0xf) << 4) | (a[0] & 0xf)) & 0xff); break;
    case 'const/16': b.push(op, a[0] & 0xff); push16(a[1] & 0xffff); break;
    case 'const-string': b.push(op, a[0] & 0xff); push16(stringIndex.get(a[1])); break;
    case 'new-instance': b.push(op, a[0] & 0xff); push16(typeIndex.get(a[1])); break;
    case 'new-array': b.push(op, ((a[0] & 0xf) | ((a[1] & 0xf) << 4)) & 0xff); push16(typeIndex.get(a[2])); break;
    case 'iget-object':
    case 'iput-object': b.push(op, ((a[0] & 0xf) | ((a[1] & 0xf) << 4)) & 0xff); push16(fieldIndex.get(a[2])); break;
    case 'aput-object': b.push(op, a[0] & 0xff, a[1] & 0xff, a[2] & 0xff); break;
    case 'if-eq':
    case 'if-ne': b.push(op, ((a[0] & 0xf) | ((a[1] & 0xf) << 4)) & 0xff); push16(0); break;
    case 'if-eqz':
    case 'if-nez': b.push(op, a[0] & 0xff); push16(0); break;
    case 'invoke-virtual':
    case 'invoke-super':
    case 'invoke-direct':
    case 'invoke-static':
    case 'invoke-interface': {
      const regs = a[0];
      const count = regs.length;
      if (count > 5) throw new Error('too many registers in ' + a[1]);
      b.push(op, count & 0xff);
      push16(methodIndex.get(a[1]));
      const c = regs[0] !== undefined ? regs[0] : 0xf;
      const d = regs[1] !== undefined ? regs[1] : 0xf;
      const e = regs[2] !== undefined ? regs[2] : 0xf;
      const f = regs[3] !== undefined ? regs[3] : 0xf;
      b.push((c | (d << 4)) & 0xff, (e | (f << 4)) & 0xff);
      break;
    }
    default: throw new Error('unknown op ' + insn.op);
  }
  return Buffer.from(b);
}

function assembleCode(code) {
  const bytes = [];
  const labels = new Map(); // label -> byte offset (start of next instruction)
  const branches = []; // { insnByteOff, offsetBytePos }

  for (const insn of code) {
    if (insn.label) { labels.set(insn.label, bytes.length); continue; }
    const insnByteOff = bytes.length;
    const buf = encodeInstruction(insn);
    // record branch offset position (last 2 bytes for 21t/22t)
    if (insn.op === 'if-eq' || insn.op === 'if-ne' || insn.op === 'if-eqz' || insn.op === 'if-nez') {
      branches.push({ insnByteOff, offsetBytePos: bytes.length + buf.length - 2, label: insn.args[insn.args.length - 1] });
    }
    bytes.push(...buf);
  }

  for (const br of branches) {
    const target = labels.get(br.label);
    if (target === undefined) throw new Error('unresolved label ' + br.label);
    const delta = (target - br.insnByteOff) / 2;
    bytes[br.offsetBytePos] = delta & 0xff;
    bytes[br.offsetBytePos + 1] = (delta >> 8) & 0xff;
  }
  return bytes;
}

function computeOuts(code) {
  let max = 0;
  for (const insn of code) {
    if (insn.op && insn.op.startsWith('invoke')) max = Math.max(max, insn.args[0].length);
  }
  return max;
}

/* ------------------------------------------------------------------ *
 *  Build the DEX file
 * ------------------------------------------------------------------ */
function buildDex() {
  const headerSize = 0x70;

  // --- string data ---
  const stringDataParts = [];
  const stringDataRel = [];
  let cur = 0;
  for (const s of strings) {
    stringDataRel.push(cur);
    const item = Buffer.concat([uleb128(s.length), mutf8(s), Buffer.from([0])]);
    stringDataParts.push(item);
    cur += item.length;
  }
  const stringDataBlob = Buffer.concat(stringDataParts);

  // --- code items ---
  const codeItems = {};
  for (const cd of CLASS_DEFS) {
    for (const m of [...cd.direct, ...cd.virtual]) {
      const body = bodies[m.method];
      if (!body) throw new Error('no body for ' + m.method);
      const bytes = assembleCode(body.code);
      let insns = Buffer.from(bytes);
      if (insns.length % 4 !== 0) insns = Buffer.concat([insns, Buffer.from([0, 0])]);
      const head = Buffer.alloc(16);
      head.writeUInt16LE(body.regs, 0);
      head.writeUInt16LE(body.ins, 2);
      head.writeUInt16LE(computeOuts(body.code), 4);
      head.writeUInt16LE(0, 6);
      head.writeUInt32LE(0, 8);
      head.writeUInt32LE(bytes.length / 2, 12); // insns_size in code units
      codeItems[m.method] = Buffer.concat([head, insns]);
    }
  }

  // --- id tables sizes (fixed) ---
  const dataOff = headerSize
    + strings.length * 4
    + types.length * 4
    + protoList.length * 12
    + FIELDS.length * 8
    + methodList.length * 8
    + CLASS_DEFS.length * 32;

  // --- data section layout ---
  const parts = [];
  let dcur = 0;
  const place = (buf, align) => {
    while (dcur % align !== 0) { parts.push(Buffer.from([0])); dcur++; }
    const off = dcur;
    parts.push(buf); dcur += buf.length;
    return off;
  };

  // type lists
  const typeListOff = new Array(protoList.length).fill(0);
  for (let i = 0; i < protoList.length; i++) {
    const p = protoList[i];
    if (p.params.length === 0) continue;
    const buf = Buffer.alloc(4 + p.params.length * 2);
    buf.writeUInt32LE(p.params.length, 0);
    p.params.forEach((pt, k) => buf.writeUInt16LE(typeIndex.get(pt), 4 + k * 2));
    typeListOff[i] = place(buf, 4);
  }

  // code items
  const codeOff = {};
  for (const key of Object.keys(codeItems)) codeOff[key] = place(codeItems[key], 4);

  // string data
  const stringDataBase = place(stringDataBlob, 1);

  // class data (needs code offsets -> now known)
  const classDataOff = {};
  for (const cd of CLASS_DEFS) {
    const parts2 = [];
    parts2.push(uleb128(0)); // static fields
    parts2.push(uleb128(cd.instanceFields.length));
    parts2.push(uleb128(cd.direct.length));
    parts2.push(uleb128(cd.virtual.length));
    // fields must be encoded in increasing global field-index order
    const fieldKey = (fname) => {
      const ftype = fname === 'this$0' ? MA : fname === 'webView' ? WebView : ValueCallback;
      return cd.cls + '->' + fname + ':' + ftype;
    };
    const sortedFields = cd.instanceFields
      .map((fname) => ({ fname, idx: fieldIndex.get(fieldKey(fname)) }))
      .sort((a, b) => a.idx - b.idx);
    let prevField = 0;
    for (const f of sortedFields) {
      parts2.push(uleb128(f.idx - prevField)); prevField = f.idx;
      parts2.push(uleb128(0));
    }
    // methods must be encoded in increasing global method-index order
    const sortedMethods = [...cd.direct, ...cd.virtual]
      .map((m) => ({ m, idx: methodIndex.get(m.method) }))
      .sort((a, b) => a.idx - b.idx);
    let prevMethod = 0;
    for (const sm of sortedMethods) {
      parts2.push(uleb128(sm.idx - prevMethod)); prevMethod = sm.idx;
      parts2.push(uleb128(sm.m.access));
      parts2.push(uleb128(dataOff + codeOff[sm.m.method])); // absolute code offset
    }
    classDataOff[cd.cls] = place(Buffer.concat(parts2), 1);
  }

  // map list (last item of the data section)
  while (dcur % 4 !== 0) { parts.push(Buffer.from([0])); dcur++; }
  const mapOffRel = dcur;
  const mapItems = [];
  const addMap = (type, size, off) => mapItems.push({ type, size, off });
  addMap(0x0000, 1, 0);
  addMap(0x0001, strings.length, 0x70);
  addMap(0x0002, types.length, 0x70 + strings.length * 4);
  addMap(0x0003, protoList.length, 0x70 + strings.length * 4 + types.length * 4);
  addMap(0x0004, FIELDS.length, 0x70 + strings.length * 4 + types.length * 4 + protoList.length * 12);
  addMap(0x0005, methodList.length, 0x70 + strings.length * 4 + types.length * 4 + protoList.length * 12 + FIELDS.length * 8);
  addMap(0x0006, CLASS_DEFS.length, 0x70 + strings.length * 4 + types.length * 4 + protoList.length * 12 + FIELDS.length * 8 + methodList.length * 8);
  const typeListNonZero = typeListOff.filter((o) => o > 0);
  if (typeListNonZero.length) addMap(0x1001, typeListNonZero.length, dataOff + Math.min(...typeListNonZero));
  addMap(0x2000, CLASS_DEFS.length, dataOff + Math.min(...Object.values(classDataOff)));
  addMap(0x2001, Object.keys(codeItems).length, dataOff + Math.min(...Object.values(codeOff)));
  addMap(0x2002, strings.length, dataOff + stringDataBase);
  addMap(0x1000, 1, dataOff + mapOffRel); // the map list itself
  mapItems.sort((a, b) => a.off - b.off);

  const mapBuf = Buffer.alloc(4 + mapItems.length * 12);
  mapBuf.writeUInt32LE(mapItems.length, 0);
  mapItems.forEach((m, i) => {
    mapBuf.writeUInt16LE(m.type, 4 + i * 12);
    mapBuf.writeUInt16LE(0, 4 + i * 12 + 2);
    mapBuf.writeUInt32LE(m.size, 4 + i * 12 + 4);
    mapBuf.writeUInt32LE(m.off, 4 + i * 12 + 8);
  });
  parts.push(mapBuf);
  dcur += mapBuf.length;

  const mapOffAbs = dataOff + mapOffRel;
  const dataSize = dcur;
  const total = dataOff + dataSize;

  const buf = Buffer.alloc(total);

  // header
  buf.write('dex\n035\0', 0, 'ascii');
  buf.writeUInt32LE(total, 32);
  buf.writeUInt32LE(headerSize, 36);
  buf.writeUInt32LE(0x12345678, 40);
  buf.writeUInt32LE(0, 44);
  buf.writeUInt32LE(0, 48);
  buf.writeUInt32LE(mapOffAbs, 52);
  buf.writeUInt32LE(strings.length, 56);
  buf.writeUInt32LE(0x70, 60);
  buf.writeUInt32LE(types.length, 64);
  buf.writeUInt32LE(0x70 + strings.length * 4, 68);
  buf.writeUInt32LE(protoList.length, 72);
  buf.writeUInt32LE(0x70 + strings.length * 4 + types.length * 4, 76);
  buf.writeUInt32LE(FIELDS.length, 80);
  buf.writeUInt32LE(0x70 + strings.length * 4 + types.length * 4 + protoList.length * 12, 84);
  buf.writeUInt32LE(methodList.length, 88);
  buf.writeUInt32LE(0x70 + strings.length * 4 + types.length * 4 + protoList.length * 12 + FIELDS.length * 8, 92);
  buf.writeUInt32LE(CLASS_DEFS.length, 96);
  buf.writeUInt32LE(0x70 + strings.length * 4 + types.length * 4 + protoList.length * 12 + FIELDS.length * 8 + methodList.length * 8, 100);
  buf.writeUInt32LE(dataSize, 104);
  buf.writeUInt32LE(dataOff, 108);

  const stringIdsOff = 0x70;
  const typeIdsOff = stringIdsOff + strings.length * 4;
  const protoIdsOff = typeIdsOff + types.length * 4;
  const fieldIdsOff = protoIdsOff + protoList.length * 12;
  const methodIdsOff = fieldIdsOff + FIELDS.length * 8;
  const classDefsOff = methodIdsOff + methodList.length * 8;

  strings.forEach((s, i) => buf.writeUInt32LE(dataOff + stringDataBase + stringDataRel[i], stringIdsOff + i * 4));
  types.forEach((t, i) => buf.writeUInt32LE(stringIndex.get(t), typeIdsOff + i * 4));
  protoList.forEach((p, i) => {
    buf.writeUInt32LE(stringIndex.get(shortyOf(p.ret, p.params)), protoIdsOff + i * 12);
    buf.writeUInt32LE(typeIndex.get(p.ret), protoIdsOff + i * 12 + 4);
    buf.writeUInt32LE(typeListOff[i] ? dataOff + typeListOff[i] : 0, protoIdsOff + i * 12 + 8);
  });
  FIELDS.forEach((f, i) => {
    buf.writeUInt16LE(typeIndex.get(f.cls), fieldIdsOff + i * 8);
    buf.writeUInt16LE(typeIndex.get(f.type), fieldIdsOff + i * 8 + 2);
    buf.writeUInt32LE(stringIndex.get(f.name), fieldIdsOff + i * 8 + 4);
  });
  methodList.forEach((m, i) => {
    buf.writeUInt16LE(typeIndex.get(m.cls), methodIdsOff + i * 8);
    buf.writeUInt16LE(protoIndex.get(m.ret + '|' + m.params.join(',')), methodIdsOff + i * 8 + 2);
    buf.writeUInt32LE(stringIndex.get(m.name), methodIdsOff + i * 8 + 4);
  });
  CLASS_DEFS.forEach((cd, i) => {
    const off = classDefsOff + i * 32;
    buf.writeUInt32LE(typeIndex.get(cd.cls), off);
    buf.writeUInt32LE(cd.access, off + 4);
    buf.writeUInt32LE(typeIndex.get(cd.super), off + 8);
    buf.writeUInt32LE(0, off + 12);
    buf.writeUInt32LE(stringIndex.get(cd.source), off + 16);
    buf.writeUInt32LE(0, off + 20);
    buf.writeUInt32LE(dataOff + classDataOff[cd.cls], off + 24);
    buf.writeUInt32LE(0, off + 28);
  });

  // data section
  Buffer.concat(parts).copy(buf, dataOff);

  // signature (over [32..end]) first, then checksum (adler32 over [12..end])
  crypto.createHash('sha1').update(buf.subarray(32)).digest().copy(buf, 12);
  buf.writeUInt32LE(adler32(buf.subarray(12)), 8);

  return buf;
}

function adler32(buf) {
  let a = 1, b = 0;
  const MOD = 65521;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % MOD;
    b = (b + a) % MOD;
  }
  return ((b << 16) | a) >>> 0;
}

module.exports = { buildDex };

// Only write to disk when run directly (not when required by build_apk.cjs)
if (require.main === module) {
  const out = buildDex();
  const outPath = process.argv[2] || 'classes.dex';
  fs.writeFileSync(outPath, out);
  console.log('classes.dex written:', outPath, out.length, 'bytes');
}
