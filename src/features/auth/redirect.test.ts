import { describe, expect, it } from 'vitest';
import { callbackError, callbackUrl, safeNextPath, signInPath } from './redirect';

describe('sign-in redirects', () => {
  it('AC-B.9 only returns to paths on this site', () => {
    expect(safeNextPath('/history')).toBe('/history');
    expect(safeNextPath('/results/abc?x=1')).toBe('/results/abc?x=1');
    for (const unsafe of [
      null,
      undefined,
      '',
      'history',
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      '/x\nLocation: y',
      '/sign-in',
      '/auth/callback?next=/x',
    ]) {
      expect(safeNextPath(unsafe)).toBe('/dashboard');
    }
  });

  it('AC-B.7 builds the callback URL with the page to return to', () => {
    expect(callbackUrl('https://app.example', '/history')).toBe(
      'https://app.example/auth/callback?next=%2Fhistory',
    );
    expect(callbackUrl('https://app.example', '//evil')).toBe(
      'https://app.example/auth/callback?next=%2Fdashboard',
    );
  });

  it('builds the sign-in path, leaving out the default destination', () => {
    expect(signInPath('/dashboard')).toBe('/sign-in');
    expect(signInPath('/exam?x=1')).toBe('/sign-in?next=%2Fexam%3Fx%3D1');
  });

  it('AC-B.9 reads errors from the query string or the hash', () => {
    expect(callbackError('?error=access_denied&error_description=Link+expired', '')).toBe(
      'Link expired',
    );
    expect(callbackError('', '#error=server_error')).toBe('server_error');
    expect(callbackError('?next=/x', '')).toBe(null);
  });
});
