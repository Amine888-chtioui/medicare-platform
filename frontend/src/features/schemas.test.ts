import { describe, expect, it } from 'vitest';
import { createAppointmentSchema } from '@/features/appointment/appointmentSchema';
import { loginSchema } from '@/features/admin/authSchema';

const t = (key: string) => key;
const appointmentSchema = createAppointmentSchema(t);

function parseAppointment(phoneNumber: string) {
  return appointmentSchema.safeParse({
    fullName: 'Salma El Amrani',
    phoneNumber,
    appointmentDate: '2026-11-25',
    startTime: '10:00',
    description: '',
  });
}

describe('appointment schema', () => {
  it.each(['0612345678', '0712345678', '0512345678', '+212612345678', '00212612345678'])(
    'accepts Moroccan phone number %s',
    (phone) => {
      expect(parseAppointment(phone).success).toBe(true);
    }
  );

  it.each(['0812345678', '061234567', '06123456789', 'abcdefghij', '+33612345678'])(
    'rejects invalid phone number %s',
    (phone) => {
      expect(parseAppointment(phone).success).toBe(false);
    }
  );

  it('requires a name of at least two characters', () => {
    const result = appointmentSchema.safeParse({
      fullName: 'A',
      phoneNumber: '0612345678',
      appointmentDate: '2026-11-25',
      startTime: '10:00',
      description: '',
    });

    expect(result.success).toBe(false);
  });

  it('requires desired appointment date and time', () => {
    const missingDate = appointmentSchema.safeParse({
      fullName: 'Salma El Amrani',
      phoneNumber: '0612345678',
      appointmentDate: '',
      startTime: '10:00',
    });
    expect(missingDate.success).toBe(false);

    const missingTime = appointmentSchema.safeParse({
      fullName: 'Salma El Amrani',
      phoneNumber: '0612345678',
      appointmentDate: '2026-11-25',
      startTime: '',
    });
    expect(missingTime.success).toBe(false);
  });

  it('rejects a description longer than 500 characters', () => {
    const result = appointmentSchema.safeParse({
      fullName: 'Salma El Amrani',
      phoneNumber: '0612345678',
      appointmentDate: '2026-11-25',
      startTime: '10:00',
      description: 'a'.repeat(501),
    });

    expect(result.success).toBe(false);
  });

  it('accepts an empty description', () => {
    expect(parseAppointment('0612345678').success).toBe(true);
  });
});

describe('login schema', () => {
  const schema = loginSchema(t);

  it('trims the username', () => {
    const result = schema.safeParse({ username: '  admin  ', password: 'secret' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe('admin');
    }
  });

  it('requires both fields', () => {
    expect(schema.safeParse({ username: '', password: 'secret' }).success).toBe(false);
    expect(schema.safeParse({ username: 'admin', password: '' }).success).toBe(false);
  });
});
