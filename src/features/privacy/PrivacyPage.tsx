import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Where your data lives',
    body: (
      <>
        CloudPrep has no account and no server. Your progress, exam history, settings and any
        integrity logs are stored only in this browser on this device. Nothing is sent anywhere.
        Clearing your browsing data removes them.
      </>
    ),
  },
  {
    title: 'What is monitored',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong className="text-fg">Standard practice</strong> monitors nothing.
        </li>
        <li>
          <strong className="text-fg">Strict practice</strong> records when the exam tab is hidden
          or shown, when the window loses or regains focus, and when fullscreen is entered, exited
          or unavailable.
        </li>
        <li>
          <strong className="text-fg">AI-proctored exams</strong> also use your camera and
          microphone for the whole exam. They check your face, head position, eyes and mouth, look
          for phones, other people, books and other screens, measure sound levels, and watch for the
          mouse leaving the page, blocked shortcuts and extra displays.
        </li>
      </ul>
    ),
  },
  {
    title: 'What is stored',
    body: (
      <>
        Only the event type and its time, for example &ldquo;Exam tab hidden, 10:42:03&rdquo;. No
        video, photos, audio, face data, URLs, window titles or keystrokes are recorded or stored.
        The log is saved with the exam and shown on its results page.
      </>
    ),
  },
  {
    title: 'How the AI proctor works',
    body: (
      <>
        The proctor uses Google&apos;s open-source MediaPipe models (face landmarks and object
        detection), which run entirely on your device. CloudPrep downloads them from its own site
        when you start a proctored exam, about 25 MB the first time. Camera frames and microphone
        sound are analysed in memory and discarded straight away: nothing is recorded, saved or
        uploaded, and only loudness is measured, not words. CloudPrep doesn&apos;t recognise who you
        are or interpret emotions. Your camera image is always shown on screen while the proctor is
        on.
      </>
    ),
  },
  {
    title: 'Limits',
    body: (
      <>
        Strict practice only logs events and never judges them. The AI proctor you opt into does
        judge: it gives warnings and can end the exam, and its detection is approximate, so it can
        miss things or react to innocent ones. A browser can&apos;t see other apps, devices out of
        view or a second screen in every browser, and fullscreen doesn&apos;t block other apps.
        Neither mode produces an integrity score.
      </>
    ),
  },
  {
    title: 'How to stop monitoring',
    body: (
      <>
        In strict practice, use &ldquo;Stop monitoring&rdquo; in the bar under the exam header; the
        exam continues normally. A proctored exam can&apos;t run without the proctor: turning off
        the camera or microphone ends it, and finishing the exam or closing the page stops them.
        Monitoring, the camera and the microphone always stop when the exam ends.
      </>
    ),
  },
  {
    title: 'How to delete records',
    body: (
      <>
        Delete one exam&apos;s log with &ldquo;Delete log&rdquo; on its results page, delete all
        exams (and their logs) with &ldquo;Clear history&rdquo;, or delete everything with
        &ldquo;Reset everything&rdquo; in{' '}
        <Link
          to="/settings"
          className="font-medium text-accent-fg underline-offset-4 hover:underline"
        >
          Settings
        </Link>
        .
      </>
    ),
  },
];

export function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy"
        description="What CloudPrep stores, and what strict practice and the AI proctor monitor."
      />
      <div className="flex max-w-prose flex-col gap-6">
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardHeader title={section.title} />
            <CardBody className="text-sm leading-relaxed text-fg-muted">{section.body}</CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
