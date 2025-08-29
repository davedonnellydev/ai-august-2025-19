export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }

  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined) ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    'http://localhost:3000'
  );
}
