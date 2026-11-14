import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Field, SegmentedControl, Select, Switch, TextInput } from './FormControls';

describe('Switch', () => {
  function SwitchHarness() {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        label="Shuffle answer options"
        description="Randomise option order."
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  }

  it('exposes switch semantics with its label and description', () => {
    render(<SwitchHarness />);
    const control = screen.getByRole('switch', { name: 'Shuffle answer options' });
    expect(control).not.toBeChecked();
    expect(control).toHaveAccessibleDescription('Randomise option order.');
  });

  it('toggles with a click on the label and with the Space key', async () => {
    const user = userEvent.setup();
    render(<SwitchHarness />);
    const control = screen.getByRole('switch', { name: 'Shuffle answer options' });

    await user.click(screen.getByText('Shuffle answer options'));
    expect(control).toBeChecked();

    control.focus();
    await user.keyboard(' ');
    expect(control).not.toBeChecked();
  });
});

describe('SegmentedControl', () => {
  function SegmentedHarness() {
    const [value, setValue] = useState<'5' | '10' | '20'>('10');
    return (
      <>
        <SegmentedControl
          label="Session length"
          value={value}
          onValueChange={setValue}
          options={[
            { value: '5', label: '5' },
            { value: '10', label: '10' },
            { value: '20', label: '20' },
          ]}
        />
        <output>{value}</output>
      </>
    );
  }

  it('renders a labelled radio group with the current value checked', () => {
    render(<SegmentedHarness />);
    expect(screen.getByRole('group', { name: 'Session length' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '10' })).toBeChecked();
  });

  it('changes value with arrow keys and clicks', async () => {
    const user = userEvent.setup();
    render(<SegmentedHarness />);

    screen.getByRole('radio', { name: '10' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '20' })).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('20');

    await user.click(screen.getByText('5'));
    expect(screen.getByRole('radio', { name: '5' })).toBeChecked();
  });
});

describe('Select and Field', () => {
  function SelectHarness() {
    const [value, setValue] = useState<'70' | '80'>('70');
    return (
      <Field label="Pass benchmark" description="Practice only.">
        {({ id, describedBy }) => (
          <Select
            id={id}
            aria-describedby={describedBy}
            value={value}
            onValueChange={setValue}
            options={[
              { value: '70', label: '70%' },
              { value: '80', label: '80%' },
            ]}
          />
        )}
      </Field>
    );
  }

  it('links the label and description to the control and changes value', async () => {
    const user = userEvent.setup();
    render(<SelectHarness />);
    const select = screen.getByRole('combobox', { name: 'Pass benchmark' });
    expect(select).toHaveAccessibleDescription('Practice only.');
    await user.selectOptions(select, '80');
    expect(select).toHaveValue('80');
  });

  it('describes the control with its error and marks it invalid', () => {
    render(
      <Field label="Name" error="Required.">
        {({ id, describedBy, invalid }) => (
          <TextInput id={id} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('Required.');
  });
});
