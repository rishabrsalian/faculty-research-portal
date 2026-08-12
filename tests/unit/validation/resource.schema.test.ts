import { PatentStatus, ProjectStatus } from '@prisma/client';
import {
  createPatentSchema,
  updatePatentSchema,
  patentQuerySchema,
} from '../../../src/validation/patent.schema';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from '../../../src/validation/project.schema';
import {
  createContributionSchema,
  updateContributionSchema,
  contributionQuerySchema,
} from '../../../src/validation/contribution.schema';

describe('patent schemas', () => {
  it('requires a title and accepts the optional fields', () => {
    expect(createPatentSchema.safeParse({ body: {} }).success).toBe(false);
    expect(
      createPatentSchema.safeParse({
        body: {
          title: 'A Novel Widget',
          applicationNo: 'APP-1',
          patentNo: 'PAT-1',
          filingDate: '2023-01-01T00:00:00.000Z',
          grantDate: '2024-01-01T00:00:00.000Z',
          country: 'IN',
          status: PatentStatus.GRANTED,
          inventors: ['A. Kumar', 'B. Rao'],
        },
      }).success
    ).toBe(true);
  });

  it('rejects an unknown status and a non-ISO filing date', () => {
    expect(
      createPatentSchema.safeParse({ body: { title: 'X', status: 'PENDING_MAYBE' } }).success
    ).toBe(false);
    expect(createPatentSchema.safeParse({ body: { title: 'X', filingDate: '2023-01-01' } }).success).toBe(
      false
    );
  });

  it('makes the title optional on update', () => {
    expect(updatePatentSchema.safeParse({ body: {} }).success).toBe(true);
    expect(updatePatentSchema.safeParse({ body: { country: 'US' } }).success).toBe(true);
  });

  it('validates query filters', () => {
    expect(
      patentQuerySchema.safeParse({ query: { page: '1', status: PatentStatus.FILED } }).success
    ).toBe(true);
    expect(patentQuerySchema.safeParse({ query: { status: 'NOPE' } }).success).toBe(false);
  });
});

describe('project schemas', () => {
  it('requires a title and accepts a numeric amount', () => {
    expect(createProjectSchema.safeParse({ body: {} }).success).toBe(false);
    expect(
      createProjectSchema.safeParse({
        body: {
          title: 'Smart Grid Optimisation',
          fundingAgency: 'DST',
          amount: 2500000,
          startDate: '2023-04-01T00:00:00.000Z',
          endDate: '2026-03-31T00:00:00.000Z',
          status: ProjectStatus.ONGOING,
          role: 'PI',
          coInvestigators: ['C. Nair'],
        },
      }).success
    ).toBe(true);
  });

  it('rejects a string amount and an unknown status', () => {
    expect(createProjectSchema.safeParse({ body: { title: 'X', amount: '250' } }).success).toBe(false);
    expect(createProjectSchema.safeParse({ body: { title: 'X', status: 'PAUSED' } }).success).toBe(
      false
    );
  });

  it('makes every field optional on update', () => {
    expect(updateProjectSchema.safeParse({ body: {} }).success).toBe(true);
  });

  it('validates query filters', () => {
    expect(projectQuerySchema.safeParse({ query: { limit: '25' } }).success).toBe(true);
    expect(projectQuerySchema.safeParse({ query: { limit: 'many' } }).success).toBe(false);
  });
});

describe('contribution schemas', () => {
  it('requires type and title', () => {
    const result = createContributionSchema.safeParse({ body: {} });
    expect(result.success).toBe(false);
    expect(result.error!.errors.map((e) => e.message)).toEqual(
      expect.arrayContaining(['Contribution type is required', 'Title is required'])
    );
  });

  it('accepts the optional fields', () => {
    expect(
      createContributionSchema.safeParse({
        body: {
          type: 'KEYNOTE',
          title: 'Keynote at ICML',
          description: 'Talk on scaling laws',
          date: '2024-07-21T09:00:00.000Z',
          organization: 'ICML',
          url: 'https://icml.cc/keynote',
        },
      }).success
    ).toBe(true);
  });

  it('rejects an invalid url and a non-ISO date', () => {
    expect(
      createContributionSchema.safeParse({ body: { type: 'T', title: 'X', url: 'icml.cc' } }).success
    ).toBe(false);
    expect(
      createContributionSchema.safeParse({ body: { type: 'T', title: 'X', date: '21-07-2024' } })
        .success
    ).toBe(false);
  });

  it('makes every field optional on update', () => {
    expect(updateContributionSchema.safeParse({ body: {} }).success).toBe(true);
    expect(updateContributionSchema.safeParse({ body: { title: 'Renamed' } }).success).toBe(true);
  });

  it('validates query filters', () => {
    expect(contributionQuerySchema.safeParse({ query: { page: '2', facultyId: 'f1' } }).success).toBe(
      true
    );
    expect(contributionQuerySchema.safeParse({ query: { page: 'two' } }).success).toBe(false);
  });
});
