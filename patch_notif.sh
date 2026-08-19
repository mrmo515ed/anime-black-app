sed -i '202a \    if (typeof (window as any).iappyx !== "undefined") {\n      (window as any).iappyx.notification.send(title, body);\n    }' src/App.tsx
