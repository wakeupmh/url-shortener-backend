import { Router } from 'express';
import { UrlController } from '../controllers/UrlController';
import { UrlService } from '../../../application/services/UrlService';
import { PgUrlRepository } from '../../../infrastructure/repositories/PgUrlRepository';
import { rateLimit } from 'express-rate-limit';
import { requireAuth } from '@clerk/express'
import { validateRequest } from '../middleware/validateRequest';
import { 
  createUrlSchema, 
  updateUrlSchema, 
  urlParamsSchema, 
  slugParamsSchema 
} from '../schemas/urlSchemas';

const urlRepository = new PgUrlRepository();
const urlService = new UrlService(urlRepository);
const urlController = new UrlController(urlService);

const router = Router();

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errors: [{
      status: '429',
      title: 'Too Many Requests',
      detail: 'You have exceeded the rate limit. Please try again later.'
    }]
  }
});

router.use('/api', apiLimiter);

router.post('/api/urls', validateRequest(createUrlSchema), urlController.createUrl.bind(urlController));

router.get('/api/urls', requireAuth(), urlController.getUserUrls.bind(urlController));
router.get('/api/urls/:id', requireAuth(), validateRequest(urlParamsSchema), urlController.getUrlById.bind(urlController));
router.patch('/api/urls/:id', requireAuth(), validateRequest(updateUrlSchema), urlController.updateUrl.bind(urlController));
router.delete('/api/urls/:id', requireAuth(), validateRequest(urlParamsSchema), urlController.deleteUrl.bind(urlController));

router.get('/:slug', validateRequest(slugParamsSchema), urlController.redirectToOriginalUrl.bind(urlController));

export default router;
