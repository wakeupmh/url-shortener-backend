import { z } from 'zod';


export const createUrlJsonApiSchema = z.object({
  body: z.object({
    data: z.object({
      type: z.literal('urls').optional(),
      attributes: z.object({
        originalUrl: z.string().url().or(z.string()),
        slug: z.string().min(1).max(50).optional()
      })
    })
  })
});

export const createUrlDirectSchema = z.object({
  body: z.object({
    originalUrl: z.string().url().or(z.string()),
    slug: z.string().min(1).max(50).optional()
  })
});

export const createUrlSchema = z.union([
  createUrlJsonApiSchema,
  createUrlDirectSchema
]);

export const urlParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  })
});

export const slugParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(50),
  })
});

export const updateUrlJsonApiSchema = z.object({
  body: z.object({
    data: z.object({
      type: z.literal('urls').optional(),
      attributes: z.object({
        originalUrl: z.string().url().or(z.string()).optional(),
        slug: z.string().min(1).max(50).optional()
      })
    })
  }),
  params: z.object({
    id: z.string().uuid(),
  })
});

export const updateUrlDirectSchema = z.object({
  body: z.object({
    originalUrl: z.string().url().or(z.string()).optional(),
    slug: z.string().min(1).max(50).optional()
  }),
  params: z.object({
    id: z.string().uuid(),
  })
});

export const updateUrlSchema = z.union([
  updateUrlJsonApiSchema,
  updateUrlDirectSchema
]);
