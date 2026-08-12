import { PublicationStatus } from '@prisma/client';
import {
  createPublicationSchema,
  updatePublicationSchema,
  publicationQuerySchema,
} from '../../../src/validation/publication.schema';

const validBody = {
  publicationTypeId: 'type-1',
  title: 'Attention Is All You Need Again',
  year: 2024,
};

describe('createPublicationSchema', () => {
  it('accepts the minimum required fields', () => {
    expect(createPublicationSchema.safeParse({ body: validBody }).success).toBe(true);
  });

  it('accepts the full set of optional fields', () => {
    const result = createPublicationSchema.safeParse({
      body: {
        ...validBody,
        abstract: 'An abstract',
        month: 12,
        doi: '10.1000/xyz',
        url: 'https://doi.org/10.1000/xyz',
        volume: '12',
        issue: '3',
        pageStart: 1,
        pageEnd: 20,
        citationCount: 0,
        isScopusIndexed: true,
        isWosIndexed: false,
        isUgcListed: true,
        status: PublicationStatus.PUBLISHED,
      },
    });
    expect(result.success).toBe(true);
  });

  it('requires publicationTypeId and title', () => {
    const result = createPublicationSchema.safeParse({ body: { year: 2024 } });
    expect(result.success).toBe(false);
    expect(result.error!.errors.map((e) => e.message)).toEqual(
      expect.arrayContaining(['Publication type is required', 'Title is required'])
    );
  });

  it('rejects a year before 1900 or beyond next year', () => {
    expect(createPublicationSchema.safeParse({ body: { ...validBody, year: 1899 } }).success).toBe(
      false
    );
    const nextYear = new Date().getFullYear() + 1;
    expect(
      createPublicationSchema.safeParse({ body: { ...validBody, year: nextYear } }).success
    ).toBe(true);
    expect(
      createPublicationSchema.safeParse({ body: { ...validBody, year: nextYear + 1 } }).success
    ).toBe(false);
  });

  it('rejects an out-of-range month and a non-integer year', () => {
    expect(createPublicationSchema.safeParse({ body: { ...validBody, month: 13 } }).success).toBe(
      false
    );
    expect(createPublicationSchema.safeParse({ body: { ...validBody, month: 0 } }).success).toBe(
      false
    );
    expect(createPublicationSchema.safeParse({ body: { ...validBody, year: 2024.5 } }).success).toBe(
      false
    );
  });

  it('rejects an invalid url, a negative citation count and an unknown status', () => {
    expect(
      createPublicationSchema.safeParse({ body: { ...validBody, url: 'not-a-url' } }).success
    ).toBe(false);
    expect(
      createPublicationSchema.safeParse({ body: { ...validBody, citationCount: -1 } }).success
    ).toBe(false);
    expect(
      createPublicationSchema.safeParse({ body: { ...validBody, status: 'MADE_UP' } }).success
    ).toBe(false);
  });
});

describe('updatePublicationSchema', () => {
  it('accepts an empty body and a single field', () => {
    expect(updatePublicationSchema.safeParse({ body: {} }).success).toBe(true);
    expect(updatePublicationSchema.safeParse({ body: { title: 'Revised' } }).success).toBe(true);
  });

  it('still enforces the field constraints it inherits', () => {
    expect(updatePublicationSchema.safeParse({ body: { year: 1800 } }).success).toBe(false);
  });
});

describe('publicationQuerySchema', () => {
  it('accepts numeric string filters', () => {
    expect(
      publicationQuerySchema.safeParse({
        query: { page: '2', limit: '10', year: '2023', status: PublicationStatus.PUBLISHED },
      }).success
    ).toBe(true);
  });

  it('accepts an empty query', () => {
    expect(publicationQuerySchema.safeParse({ query: {} }).success).toBe(true);
  });

  it('rejects non-numeric page, limit or year values', () => {
    expect(publicationQuerySchema.safeParse({ query: { page: 'first' } }).success).toBe(false);
    expect(publicationQuerySchema.safeParse({ query: { limit: '10.5' } }).success).toBe(false);
    expect(publicationQuerySchema.safeParse({ query: { year: 'recent' } }).success).toBe(false);
  });

  it('rejects an unknown status value', () => {
    expect(publicationQuerySchema.safeParse({ query: { status: 'NOPE' } }).success).toBe(false);
  });
});
