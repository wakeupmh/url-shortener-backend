import { Url } from '../../domain/entities/Url';
import { UrlRepository } from '../../domain/repositories/UrlRepository';

export class UrlService {
  constructor(private urlRepository: UrlRepository) {}

  async createUrl(originalUrl: string, slug?: string, userId?: string | null): Promise<Url> {
    console.log(`creating url: ${originalUrl}${slug ? `, slug: ${slug}` : ''}${userId ? `, user: ${userId}` : ''}`);
    
    if (slug) {
      const isUnique = await this.urlRepository.isSlugUnique(slug);
      if (!isUnique) {
        console.warn(`slug already in use: ${slug}`);
        throw new Error('Slug is already in use');
      }
    }

    const url = new Url(originalUrl, slug, userId);
    console.log(`new url created with id: ${url.getId()}, slug: ${url.getSlug()}`);
    
    return this.urlRepository.save(url);
  }

  async getUrlById(id: string): Promise<Url> {
    console.log(`getting url by id: ${id}`);
    
    const url = await this.urlRepository.findById(id);
    if (!url) {
      console.warn(`url not found with id: ${id}`);
      throw new Error('URL not found');
    }
    return url;
  }

  async getUrlBySlug(slug: string): Promise<Url> {
    console.log(`getting url by slug: ${slug}`);
    
    const url = await this.urlRepository.findBySlug(slug);
    if (!url) {
      console.warn(`url not found with slug: ${slug}`);
      throw new Error('URL not found');
    }
    return url;
  }

  async getUrlsByUserId(userId: string): Promise<Url[]> {
    console.log(`getting urls for user: ${userId}`);
    
    const urls = await this.urlRepository.findByUserId(userId);
    console.log(`found ${urls.length} urls for user: ${userId}`);
    
    return urls;
  }

  async updateUrl(id: string, originalUrl?: string, slug?: string): Promise<Url> {
    console.log(`updating url id: ${id}${originalUrl ? `, new url: ${originalUrl}` : ''}${slug ? `, new slug: ${slug}` : ''}`);
    
    const url = await this.getUrlById(id);

    if (slug && slug !== url.getSlug()) {
      const isUnique = await this.urlRepository.isSlugUnique(slug);
      if (!isUnique) {
        console.warn(`slug already in use during update: ${slug}`);
        throw new Error('Slug is already in use');
      }
      url.setSlug(slug);
    }

    if (originalUrl) {
      url.setOriginalUrl(originalUrl);
    }

    console.log(`saving updated url id: ${id}`);
    return this.urlRepository.update(url);
  }

  async deleteUrl(id: string): Promise<void> {
    console.log(`deleting url id: ${id}`);
    
    await this.getUrlById(id);
    await this.urlRepository.delete(id);
    
    console.log(`url deleted id: ${id}`);
  }

  async trackVisit(slug: string): Promise<Url> {
    console.log(`tracking visit for slug: ${slug}`);
    
    const url = await this.getUrlBySlug(slug);
    url.incrementVisitCount();
    
    console.log(`incremented visit count for slug: ${slug}, new count: ${url.getVisitCount()}`);
    
    return this.urlRepository.update(url);
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      console.warn(`invalid url format: ${url}`);
      return false;
    }
  }
}
