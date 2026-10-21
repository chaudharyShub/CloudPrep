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
    title: 'What strict practice monitors',
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
          <strong className="text-fg">Strict practice with webcam</strong> also checks, every few
          seconds, whether zero, one or more faces are visible, and records changes, camera denials
          and camera disconnections.
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
    title: 'How webcam checks work',
    body: (
      <>
        Face detection runs locally in your browser using its built-in face detector. Frames are
        analysed in memory and discarded immediately. CloudPrep does not recognise who you are and
        does not interpret expressions, emotions or intent. A visible camera indicator is shown
        while the camera is on. If your browser has no built-in face detector, the webcam option is
        unavailable.
      </>
    ),
  },
  {
    title: 'Limits',
    body: (
      <>
        These are practice aids, not proctoring. A browser can&apos;t see other devices, a second
        screen, notes or people in the room, and fullscreen doesn&apos;t block other apps. Events
        have many innocent causes, so CloudPrep never labels anything as cheating and never produces
        an integrity score.
      </>
    ),
  },
  {
    title: 'How to stop monitoring',
    body: (
      <>
        During an exam, use &ldquo;Stop monitoring&rdquo; or &ldquo;Turn camera off&rdquo; in the
        bar under the exam header. The exam continues normally. Monitoring and the camera also stop
        automatically when the exam ends. You can also deny camera permission in your browser at any
        time.
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
        description="What CloudPrep stores, and what strict practice monitors."
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
