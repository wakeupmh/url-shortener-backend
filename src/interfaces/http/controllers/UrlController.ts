import { Request, Response } from 'express';
import { UrlService } from '../../../application/services/UrlService';
import { Serializer } from 'jsonapi-serializer';
import { getAuth } from '@clerk/express'

export class UrlController {
  private urlSerializer: Serializer;

  constructor(private urlService: UrlService) {
    this.urlSerializer = new Serializer('urls', {
      attributes: ['originalUrl', 'slug', 'visitCount', 'shortUrl', 'createdAt', 'updatedAt']
    });
  }

  async createUrl (req: Request, res: Response): Promise<void> {
    try {
      const { originalUrl, slug } = req.body.data.attributes;
      const { userId } = getAuth(req)

      console.log(`request to create url: ${originalUrl?.toLowerCase()}${slug ? `, slug: ${slug.toLowerCase()}` : ''}${userId ? `, user: ${userId.toLowerCase()}` : ''}`);

      if (!originalUrl) {
        console.warn(`missing original url in request`);
        res.status(400).json({
          errors: [{
            status: '400',
            title: 'Bad Request',
            detail: 'Original URL is required'
          }]
        });
        return;
      }

      if (!this.urlService.isValidUrl(originalUrl)) {
        console.warn(`invalid url format: ${originalUrl.toLowerCase()}`);
        res.status(400).json({
          errors: [{
            status: '400',
            title: 'Bad Request',
            detail: 'Invalid URL format'
          }]
        });
        return;
      }

      const url = await this.urlService.createUrl(originalUrl, slug, userId);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const shortUrl = `${baseUrl}/${url.getSlug()}`;
      
      const serializedUrl = this.urlSerializer.serialize({
        ...url,
        shortUrl
      });

      console.log(`url created successfully: ${url.getId().toLowerCase()}, slug: ${url.getSlug().toLowerCase()}`);
      res.status(201).json(serializedUrl);
    } catch (error) {
      if (error instanceof Error && error.message === 'Slug is already in use') {
        console.warn(`slug conflict: ${req.body.data.attributes.slug?.toLowerCase()}`);
        
        res.status(409).json({
          errors: [{
            status: '409',
            title: 'Conflict',
            detail: error.message
          }]
        });
        return;
      }

      console.error(`error creating url: ${error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()}`);
      res.status(500).json({
        errors: [{
          status: '500',
          title: 'Internal Server Error',
          detail: 'An error occurred while creating the URL'
        }]
      });
    }
  }

  async getUrlById (req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`request to get url by id: ${id.toLowerCase()}`);
      
      const url = await this.urlService.getUrlById(id);
      const { userId } = getAuth(req)
      
      if (url.getUserId() && userId !== url.getUserId()) {
        console.warn(`unauthorized access attempt for url id: ${id.toLowerCase()}, request user: ${userId?.toLowerCase()}, url owner: ${url.getUserId()?.toLowerCase()}`);
        
        res.status(403).json({
          errors: [{
            status: '403',
            title: 'Forbidden',
            detail: 'You do not have permission to access this URL'
          }]
        });
        return;
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const shortUrl = `${baseUrl}/${url.getSlug()}`;
      
      const serializedUrl = this.urlSerializer.serialize({
        ...url,
        shortUrl
      });

      console.log(`url retrieved successfully: ${id.toLowerCase()}`);
      res.status(200).json(serializedUrl);
    } catch (error) {
      if (error instanceof Error && error.message === 'URL not found') {
        console.warn(`url not found: ${req.params.id.toLowerCase()}`);
        
        res.status(404).json({
          errors: [{
            status: '404',
            title: 'Not Found',
            detail: error.message
          }]
        });
        return;
      }

      console.error(`error retrieving url: ${req.params.id.toLowerCase()}, error: ${error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()}`);
      res.status(500).json({
        errors: [{
          status: '500',
          title: 'Internal Server Error',
          detail: 'An error occurred while retrieving the URL'
        }]
      });
    }
  }

  async getUserUrls (req: Request, res: Response): Promise<void> {
    try {
      const { userId } = getAuth(req)

      if (!userId) {
        console.warn(`unauthorized access attempt for user urls`);
        
        res.status(401).json({
          errors: [{
            status: '401',
            title: 'Unauthorized',
            detail: 'Authentication required'
          }]
        });
        return;
      }

      console.log(`request to get urls for user: ${userId.toLowerCase()}`);
      const urls = await this.urlService.getUrlsByUserId(userId);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      
      const urlsWithShortUrl = urls.map(url => ({
        ...url,
        shortUrl: `${baseUrl}/${url.getSlug()}`
      }));

      const serializedUrls = this.urlSerializer.serialize(urlsWithShortUrl);
      
      console.log(`urls retrieved successfully for user: ${userId.toLowerCase()}, count: ${urls.length}`);
      res.status(200).json(serializedUrls);
    } catch (error) {
      console.error(`error retrieving user urls: ${error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()}`);
      
      res.status(500).json({
        errors: [{
          status: '500',
          title: 'Internal Server Error',
          detail: 'An error occurred while retrieving the URLs'
        }]
      });
    }
  }

  async updateUrl (req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { originalUrl, slug } = req.body.data.attributes;

      const { userId } = getAuth(req)
      
      console.log(`request to update url: ${id.toLowerCase()}${originalUrl ? `, new url: ${originalUrl.toLowerCase()}` : ''}${slug ? `, new slug: ${slug.toLowerCase()}` : ''}`);
      
      const existingUrl = await this.urlService.getUrlById(id);
      if (userId && existingUrl.getUserId() && userId !== existingUrl.getUserId()) {
        console.warn(`unauthorized update attempt for url id: ${id.toLowerCase()}, request user: ${userId.toLowerCase()}, url owner: ${existingUrl.getUserId()?.toLowerCase()}`);
        
        res.status(403).json({
          errors: [{
            status: '403',
            title: 'Forbidden',
            detail: 'You do not have permission to update this URL'
          }]
        });
        return;
      }

      if (originalUrl && !this.urlService.isValidUrl(originalUrl)) {
        console.warn(`invalid url format in update: ${originalUrl.toLowerCase()}`);
        
        res.status(400).json({
          errors: [{
            status: '400',
            title: 'Bad Request',
            detail: 'Invalid URL format'
          }]
        });
        return;
      }

      const url = await this.urlService.updateUrl(id, originalUrl, slug);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const shortUrl = `${baseUrl}/${url.getSlug()}`;
      
      const serializedUrl = this.urlSerializer.serialize({
        ...url,
        shortUrl
      });

      console.log(`url updated successfully: ${id.toLowerCase()}`);
      res.status(200).json(serializedUrl);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'URL not found') {
          console.warn(`url not found for update: ${req.params.id.toLowerCase()}`);
          
          res.status(404).json({
            errors: [{
              status: '404',
              title: 'Not Found',
              detail: error.message
            }]
          });
          return;
        }
        
        if (error.message === 'Slug is already in use') {
          console.warn(`slug conflict in update: ${req.body.data.attributes.slug?.toLowerCase()}`);
          
          res.status(409).json({
            errors: [{
              status: '409',
              title: 'Conflict',
              detail: error.message
            }]
          });
          return;
        }
      }

      console.error(`error updating url: ${req.params.id.toLowerCase()}, error: ${error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()}`);
      res.status(500).json({
        errors: [{
          status: '500',
          title: 'Internal Server Error',
          detail: 'An error occurred while updating the URL'
        }]
      });
    }
  }

  async deleteUrl (req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = getAuth(req)

      console.log(`request to delete url: ${id.toLowerCase()}`);

      const existingUrl = await this.urlService.getUrlById(id);
      if (userId && existingUrl.getUserId() && userId !== existingUrl.getUserId()) {
        console.warn(`unauthorized delete attempt for url id: ${id.toLowerCase()}, request user: ${userId.toLowerCase()}, url owner: ${existingUrl.getUserId()?.toLowerCase()}`);
        
        res.status(403).json({
          errors: [{
            status: '403',
            title: 'Forbidden',
            detail: 'You do not have permission to delete this URL'
          }]
        });
        return;
      }

      await this.urlService.deleteUrl(id);
      
      console.log(`url deleted successfully: ${id.toLowerCase()}`);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'URL not found') {
        console.warn(`url not found for deletion: ${req.params.id.toLowerCase()}`);
        
        res.status(404).json({
          errors: [{
            status: '404',
            title: 'Not Found',
            detail: error.message
          }]
        });
        return;
      }

      console.error(`error deleting url: ${req.params.id.toLowerCase()}, error: ${error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()}`);
      res.status(500).json({
        errors: [{
          status: '500',
          title: 'Internal Server Error',
          detail: 'An error occurred while deleting the URL'
        }]
      });
    }
  }

  async redirectToOriginalUrl (req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      
      console.log(`request to redirect from slug: ${slug.toLowerCase()}, referrer: ${req.headers.referer?.toLowerCase() || 'direct'}`);
      
      const url = await this.urlService.getUrlBySlug(slug);
      
      this.urlService.trackVisit(slug).catch(err => {
        console.error(`error tracking visit for slug: ${slug.toLowerCase()}, error: ${err.message.toLowerCase()}`);
      });

      console.log(`redirecting to: ${url.getOriginalUrl().toLowerCase()}, visit count: ${url.getVisitCount() + 1}`);
      
      res.redirect(url.getOriginalUrl());
    } catch (error) {
      if (error instanceof Error && error.message === 'URL not found') {
        console.warn(`slug not found for redirect: ${req.params.slug.toLowerCase()}`);
        
        res.status(404).json({
          errors: [{
            status: '404',
            title: 'Not Found',
            detail: error.message
          }]
        });
        return;
      }

      console.error(`error redirecting from slug: ${req.params.slug.toLowerCase()}, error: ${error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()}`);
      res.status(500).json({
        errors: [{
          status: '500',
          title: 'Internal Server Error',
          detail: 'An error occurred while redirecting to the original URL'
        }]
      });
    }
  }
}
