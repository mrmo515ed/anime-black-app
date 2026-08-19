import { auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  code?: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const code = error?.code || (error instanceof Error ? (error as any).code : undefined);
  const message = error?.message || (error instanceof Error ? error.message : String(error));
  
  const errInfo: FirestoreErrorInfo = {
    error: message,
    code,
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (code === 'permission-denied') {
    console.error('🔥 [Firestore Permission Denied] Read/Write blocked by Firestore Security Rules:', {
      operationType,
      path,
      user: errInfo.authInfo.userId ? `UID: ${errInfo.authInfo.userId} (${errInfo.authInfo.email})` : 'Anonymous/Unauthenticated',
      message
    });
  } else if (code === 'unauthenticated') {
    console.error('🔒 [Firestore Unauthenticated] Operation requires user authentication:', {
      operationType,
      path,
      message
    });
  } else {
    console.error('⚠️ [Firestore Error] occurred during operation:', JSON.stringify(errInfo, null, 2));
  }
}
