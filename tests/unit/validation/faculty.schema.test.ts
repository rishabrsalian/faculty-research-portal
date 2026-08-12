import { Gender } from '@prisma/client';
import { updateFacultySchema, facultyQuerySchema } from '../../../src/validation/faculty.schema';

describe('updateFacultySchema', () => {
  it('accepts an empty body since every field is optional', () => {
    expect(updateFacultySchema.safeParse({ body: {} }).success).toBe(true);
  });

  it('accepts a fully populated profile update', () => {
    const result = updateFacultySchema.safeParse({
      body: {
        designation: 'Associate Professor',
        department: 'Computer Science',
        qualification: 'PhD',
        specialization: 'Machine Learning',
        experienceYears: 12,
        dateOfJoining: '2014-07-01T00:00:00.000Z',
        dateOfBirth: '1985-03-22T00:00:00.000Z',
        gender: Gender.FEMALE,
        phone: '+91-9876543210',
        orcidId: '0000-0002-1825-0097',
        googleScholarUrl: 'https://scholar.google.com/citations?user=abc',
        scopusId: '57123456789',
        linkedinUrl: 'https://www.linkedin.com/in/example',
        researchInterests: ['NLP', 'Graph Learning'],
        bio: 'Researcher.',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative or fractional experienceYears', () => {
    expect(updateFacultySchema.safeParse({ body: { experienceYears: -1 } }).success).toBe(false);
    expect(updateFacultySchema.safeParse({ body: { experienceYears: 3.5 } }).success).toBe(false);
  });

  it('requires ISO datetime strings for dates', () => {
    expect(updateFacultySchema.safeParse({ body: { dateOfJoining: '2014-07-01' } }).success).toBe(
      false
    );
  });

  it('rejects invalid urls, an unknown gender and a non-array researchInterests', () => {
    expect(updateFacultySchema.safeParse({ body: { linkedinUrl: 'linkedin' } }).success).toBe(false);
    expect(updateFacultySchema.safeParse({ body: { gender: 'UNKNOWN' } }).success).toBe(false);
    expect(updateFacultySchema.safeParse({ body: { researchInterests: 'NLP' } }).success).toBe(false);
  });
});

describe('facultyQuerySchema', () => {
  it('accepts pagination and text filters', () => {
    expect(
      facultyQuerySchema.safeParse({
        query: { page: '1', limit: '20', search: 'kumar', department: 'CSE', designation: 'Professor' },
      }).success
    ).toBe(true);
  });

  it('rejects non-numeric pagination values', () => {
    expect(facultyQuerySchema.safeParse({ query: { page: 'one' } }).success).toBe(false);
    expect(facultyQuerySchema.safeParse({ query: { limit: '-5' } }).success).toBe(false);
  });
});
