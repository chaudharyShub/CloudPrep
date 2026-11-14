import { useState, type ReactNode } from 'react';
import { ArrowRight, Bookmark, Flag, Inbox, Plus, Settings } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, SegmentedControl, Select, Switch, TextInput } from '@/components/ui/FormControls';
import { Notice } from '@/components/ui/Notice';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

/** Development-only gallery of every design-system primitive and state. */
export function DesignSystemPage() {
  const [theme, setTheme] = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [segment, setSegment] = useState<'a' | 'b' | 'c'>('a');
  const [select, setSelect] = useState<'one' | 'two'>('one');
  const [text, setText] = useState('');
  const { showToast } = useToast();

  return (
    <>
      <PageHeader
        title="Design system"
        description="Development-only gallery of CloudPrep's UI primitives. Not included in production builds."
        actions={
          <SegmentedControl
            label="Theme"
            hideLabel
            value={theme}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
            onValueChange={setTheme}
          />
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Buttons">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" icon={Plus}>
              Small
            </Button>
            <Button variant="secondary" icon={ArrowRight} iconPosition="end">
              Next
            </Button>
            <IconButton label="Flag question" icon={Flag} />
            <IconButton label="Bookmark" icon={Bookmark} variant="secondary" />
          </div>
        </Section>

        <Section title="Badges and progress">
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="success">Correct</Badge>
            <Badge tone="warning">Flagged</Badge>
            <Badge tone="danger">Incorrect</Badge>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <ProgressBar label="Example accent" value={64} />
            <ProgressBar label="Example success" value={82} tone="success" size="md" />
            <ProgressBar label="Example warning" value={35} tone="warning" />
            <ProgressBar label="Example danger" value={12} tone="danger" />
          </div>
        </Section>

        <Section title="Notices and toasts">
          <div className="flex flex-col gap-3">
            <Notice title="Info">Informational message.</Notice>
            <Notice tone="success">Saved successfully.</Notice>
            <Notice tone="warning">Five minutes remaining.</Notice>
            <Notice tone="danger">Couldn't read saved data.</Notice>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast({ title: 'Settings saved', tone: 'success' })}
              >
                Success toast
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  showToast({
                    title: 'Storage full',
                    description: 'Export your data, then remove old attempts.',
                    tone: 'danger',
                    durationMs: null,
                  })
                }
              >
                Persistent error toast
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Form controls">
          <div className="flex flex-col gap-5">
            <Field label="Text input" description="With a description.">
              {({ id, describedBy }) => (
                <TextInput
                  id={id}
                  aria-describedby={describedBy}
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                  }}
                  placeholder="Type here"
                />
              )}
            </Field>
            <Field label="Input with error" error="This field is required.">
              {({ id, describedBy, invalid }) => (
                <TextInput id={id} aria-describedby={describedBy} aria-invalid={invalid} />
              )}
            </Field>
            <Field label="Select">
              {({ id }) => (
                <Select
                  id={id}
                  value={select}
                  onValueChange={setSelect}
                  options={[
                    { value: 'one', label: 'Option one' },
                    { value: 'two', label: 'Option two' },
                  ]}
                />
              )}
            </Field>
            <Switch
              label="Switch"
              description="Toggle with Space."
              checked={switchOn}
              onCheckedChange={setSwitchOn}
            />
            <SegmentedControl
              label="Segmented control"
              value={segment}
              onValueChange={setSegment}
              options={[
                { value: 'a', label: 'First' },
                { value: 'b', label: 'Second' },
                { value: 'c', label: 'Third' },
              ]}
            />
          </div>
        </Section>

        <Section title="Dialogs">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              Open dialog
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmOpen(true);
              }}
            >
              Open confirmation
            </Button>
          </div>
          <Dialog
            open={dialogOpen}
            onClose={() => {
              setDialogOpen(false);
            }}
            title="Example dialog"
            description="Focus stays inside until it closes. Press Esc to close."
            footer={
              <Button
                onClick={() => {
                  setDialogOpen(false);
                }}
              >
                Done
              </Button>
            }
          >
            <p className="text-sm text-fg-muted">Dialog body content.</p>
          </Dialog>
          <ConfirmDialog
            open={confirmOpen}
            title="Delete example?"
            description="Type-to-confirm guards destructive actions."
            confirmLabel="Delete"
            tone="danger"
            confirmationText="DELETE"
            onCancel={() => {
              setConfirmOpen(false);
            }}
            onConfirm={() => {
              setConfirmOpen(false);
              showToast({ title: 'Confirmed', tone: 'success' });
            }}
          />
        </Section>

        <Section title="Empty state">
          <EmptyState
            icon={Inbox}
            headingLevel="h3"
            title="Nothing here yet"
            description="Empty states explain what will appear and how to get started."
            action={
              <Button variant="secondary" icon={Settings}>
                Call to action
              </Button>
            }
            className="py-6"
          />
        </Section>

        <div className="lg:col-span-2">
          <Section title="Loading skeleton">
            <PageSkeleton />
          </Section>
        </div>
      </div>
    </>
  );
}
