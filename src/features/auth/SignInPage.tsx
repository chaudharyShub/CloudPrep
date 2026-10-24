import { useState, type SyntheticEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody } from '@/components/ui/Card';
import { Field, TextInput } from '@/components/ui/FormControls';
import { Notice } from '@/components/ui/Notice';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { isPlausibleEmail } from '@/backend/auth';
import { useAuth } from '@/state/AuthProvider';
import { callbackUrl, DEFAULT_AFTER_SIGN_IN, safeNextPath } from './redirect';

export function SignInPage() {
  const { state, client } = useAuth();
  const [params] = useSearchParams();
  const next = safeNextPath(params.get('next'));
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState<'email' | 'google' | null>(null);

  if (state.status === 'loading') return <PageSkeleton />;
  if (state.status === 'signed-in') return <Navigate to={next} replace />;

  const redirectTo = callbackUrl(window.location.origin, next);

  const sendLink = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPlausibleEmail(email)) {
      setEmailError('Enter an email address, like name@example.com.');
      return;
    }
    setEmailError(undefined);
    setPending('email');
    const result = await client.sendMagicLink(email.trim(), redirectTo);
    setPending(null);
    if (result.ok) setSentTo(email.trim());
    else setEmailError(result.message);
  };

  const continueWithGoogle = async () => {
    setGoogleError(null);
    setPending('google');
    const result = await client.signInWithGoogle(redirectTo);
    // On success the browser leaves for Google, so only failures land here.
    if (!result.ok) {
      setPending(null);
      setGoogleError(result.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Sign in"
        description={
          client.emailSignIn
            ? "Sign in with a link sent to your email, or with Google. There's no password."
            : "Sign in with your Google account. There's no password."
        }
      />

      <div className="flex max-w-prose flex-col gap-6">
        {next !== DEFAULT_AFTER_SIGN_IN && (
          <Notice title="Sign in to continue">
            Mock exams, your dashboard, exam history and progress need an account.
          </Notice>
        )}

        {!client.available ? (
          <Notice tone="warning" title="Sign-in isn't available">
            Sign-in isn't set up on this site, so mock exams, the dashboard and history can't be
            used. Learning mode still works.
          </Notice>
        ) : (
          <Card>
            <CardBody className="flex flex-col gap-6">
              {!client.emailSignIn ? null : sentTo ? (
                <div role="status" className="flex flex-col items-start gap-4">
                  <Notice tone="success" title="Check your email">
                    We sent a sign-in link to <strong className="text-fg">{sentTo}</strong>. Open it
                    in this browser on this device to finish signing in. The link works once and
                    expires in an hour.
                  </Notice>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSentTo(null);
                    }}
                  >
                    Use a different email
                  </Button>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={(event) => void sendLink(event)}
                  className="flex flex-col gap-4"
                >
                  <Field label="Email address" error={emailError}>
                    {({ id, describedBy, invalid }) => (
                      <TextInput
                        id={id}
                        type="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        aria-describedby={describedBy}
                        aria-invalid={invalid}
                        onChange={(event) => {
                          setEmail(event.target.value);
                        }}
                      />
                    )}
                  </Field>
                  <Button
                    type="submit"
                    icon={Mail}
                    disabled={pending !== null}
                    className="self-start"
                  >
                    {pending === 'email' ? 'Sending…' : 'Email me a sign-in link'}
                  </Button>
                </form>
              )}

              {client.emailSignIn && (
                <div className="flex items-center gap-3 text-sm text-fg-subtle" aria-hidden="true">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}

              <div className="flex flex-col items-start gap-3">
                <Button
                  variant="secondary"
                  disabled={pending !== null}
                  onClick={() => void continueWithGoogle()}
                >
                  {pending === 'google' ? 'Opening Google…' : 'Continue with Google'}
                </Button>
                {googleError && (
                  <p role="alert" className="text-sm text-danger">
                    {googleError}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        <Notice title="Just want to practise?">
          Learning mode and bookmarks work without an account. As a guest, your progress stays in
          this browser only.
          <div className="mt-3">
            <Link to="/practice" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
              Continue as a guest
            </Link>
          </div>
        </Notice>
      </div>
    </>
  );
}
