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
      let originalUrl: string;
      let slug: string | undefined;
      
      if (req.body.data && req.body.data.attributes) {
        originalUrl = req.body.data.attributes.originalUrl;
        slug = req.body.data.attributes.slug;
      } else {
        originalUrl = req.body.originalUrl;
        slug = req.body.slug;
      }
      
      const { userId } = getAuth(req)

      console.log(`request to create url: ${originalUrl}${slug ? `, slug: ${slug}` : ''}${userId ? `, user: ${userId}` : ''}`);

      const url = await this.urlService.createUrl(originalUrl, slug, userId);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const shortUrl = `${baseUrl}/${url.getSlug()}`;
      
      const serializedUrl = this.urlSerializer.serialize({
        ...url,
        shortUrl
      });

      console.log(`url created successfully: ${url.getId()}, slug: ${url.getSlug()}`);
      res.status(201).json(serializedUrl);
    } catch (error) {
      if (error instanceof Error && error.message === 'Slug is already in use') {
        console.warn(`slug conflict: ${req.body.slug || (req.body.data?.attributes?.slug || '')}`);
        
        res.status(409).json({
          errors: [{
            status: '409',
            title: 'Conflict',
            detail: error.message
          }]
        });
        return;
      }

      console.error(`error creating url: ${error instanceof Error ? error.message : String(error)}`);
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
      console.log(`request to get url by id: ${id}`);
      
      const url = await this.urlService.getUrlById(id);
      const { userId } = getAuth(req)
      
      if (url.getUserId() && userId !== url.getUserId()) {
        console.warn(`unauthorized access attempt for url id: ${id}, request user: ${userId}, url owner: ${url.getUserId()}`);
        
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

      console.log(`url retrieved successfully: ${id}`);
      res.status(200).json(serializedUrl);
    } catch (error) {
      if (error instanceof Error && error.message === 'URL not found') {
        console.warn(`url not found: ${req.params.id}`);
        
        res.status(404).json({
          errors: [{
            status: '404',
            title: 'Not Found',
            detail: error.message
          }]
        });
        return;
      }

      console.error(`error retrieving url: ${error instanceof Error ? error.message : String(error)}`);
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
      const { userId } = getAuth(req);
      
      if (!userId) {
        console.warn('attempt to get user urls without authentication');
        
        res.status(401).json({
          errors: [{
            status: '401',
            title: 'Unauthorized',
            detail: 'Authentication is required to access this resource'
          }]
        });
        return;
      }

      console.log(`request to get urls for user: ${userId}`);
      
      const urls = await this.urlService.getUrlsByUserId(userId);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      
      const urlsWithShortUrl = urls.map(url => ({
        ...url,
        shortUrl: `${baseUrl}/${url.getSlug()}`
      }));
      
      const serializedUrls = this.urlSerializer.serialize(urlsWithShortUrl);

      console.log(`retrieved ${urls.length} urls for user: ${userId}`);
      res.status(200).json(serializedUrls);
    } catch (error) {
      console.error(`error retrieving user urls: ${error instanceof Error ? error.message : String(error)}`);
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
      
      let originalUrl: string | undefined;
      let slug: string | undefined;
      
      if (req.body.data && req.body.data.attributes) {
        originalUrl = req.body.data.attributes.originalUrl;
        slug = req.body.data.attributes.slug;
      } else {
        originalUrl = req.body.originalUrl;
        slug = req.body.slug;
      }

      const { userId } = getAuth(req)
      
      console.log(`request to update url: ${id}${originalUrl ? `, new url: ${originalUrl}` : ''}${slug ? `, new slug: ${slug}` : ''}`);
      
      const existingUrl = await this.urlService.getUrlById(id);
      if (userId && existingUrl.getUserId() && userId !== existingUrl.getUserId()) {
        console.warn(`unauthorized update attempt for url id: ${id}, request user: ${userId}, url owner: ${existingUrl.getUserId()}`);
        
        res.status(403).json({
          errors: [{
            status: '403',
            title: 'Forbidden',
            detail: 'You do not have permission to update this URL'
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

      console.log(`url updated successfully: ${id}`);
      res.status(200).json(serializedUrl);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'URL not found') {
          console.warn(`url not found for update: ${req.params.id}`);
          
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
          console.warn(`slug conflict in update: ${req.body.slug || (req.body.data?.attributes?.slug || '')}`);
          
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

      console.error(`error updating url: ${error instanceof Error ? error.message : String(error)}`);
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
      const { userId } = getAuth(req);
      
      console.log(`request to delete url: ${id}`);
      
      const url = await this.urlService.getUrlById(id);
      
      if (userId && url.getUserId() && userId !== url.getUserId()) {
        console.warn(`unauthorized delete attempt for url id: ${id}, request user: ${userId}, url owner: ${url.getUserId()}`);
        
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

      console.log(`url deleted successfully: ${id}`);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'URL not found') {
        console.warn(`url not found for delete: ${req.params.id}`);
        
        res.status(404).json({
          errors: [{
            status: '404',
            title: 'Not Found',
            detail: error.message
          }]
        });
        return;
      }

      console.error(`error deleting url: ${error instanceof Error ? error.message : String(error)}`);
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
      
      console.log(`request to redirect from slug: ${slug}, referrer: ${req.headers.referer || 'direct'}`);
      
      const url = await this.urlService.getUrlBySlug(slug);
      
      this.urlService.trackVisit(slug).catch(err => {
        console.error(`error tracking visit for slug: ${slug}, error: ${err.message}`);
      });

      console.log(`redirecting to: ${url.getOriginalUrl()}, visit count: ${url.getVisitCount() + 1}`);
      
      res.redirect(url.getOriginalUrl());
    } catch (error) {
      if (error instanceof Error && error.message === 'URL not found') {
        console.warn(`slug not found for redirect: ${req.params.slug}`);
        
        res.status(404).json({
          errors: [{
            status: '404',
            title: 'Not Found',
            detail: error.message
          }]
        });
        return;
      }

      console.error(`error redirecting from slug: ${req.params.slug}, error: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({
        errors: [{
          status: '500',
          title: 'Internal Server Error',
          detail: 'An error occurred while redirecting to the URL'
        }]
      });
    }
  }
}
