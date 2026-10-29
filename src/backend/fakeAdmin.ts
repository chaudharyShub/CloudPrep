import type { AdminUser } from '@/domain/admin/users';
import type { AdminClient } from './admin';

/** For tests and E2E builds: returns `users` when `admin` is true, otherwise forbidden. */
export function createFakeAdminClient(
  options: { admin?: boolean; users?: readonly AdminUser[]; failWith?: string } = {},
): AdminClient & { readonly calls: { count: number } } {
  const calls = { count: 0 };
  return {
    calls,
    fetchUsers() {
      calls.count += 1;
      if (options.failWith !== undefined) {
        return Promise.resolve({ status: 'error', message: options.failWith });
      }
      return Promise.resolve(
        options.admin ? { status: 'ok', users: options.users ?? [] } : { status: 'forbidden' },
      );
    },
  };
}
