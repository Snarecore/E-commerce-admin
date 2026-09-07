export function assertStrictSecurityEnv() {
  const requiredEnvs = [
    'PHONE_HMAC_SECRET_V1',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
  ];
  const missing = requiredEnvs.filter((env) => !process.env[env]);
  if (missing.length > 0) {
    throw new Error(`CRITICAL BOOT FAILURE: Missing required security environment variables: ${missing.join(', ')}`);
  }
}

let cachedHandler: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    assertStrictSecurityEnv();
    cachedHandler = async (req: any, res: any) => {
      res.status(200).json({
        success: true,
        message: 'Vercel Serverless Customer Risk API Handler Active.',
        timestamp: new Date().toISOString(),
      });
    };
  }
  return cachedHandler(req, res);
}
