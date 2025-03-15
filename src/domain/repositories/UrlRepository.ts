import { Url } from '../entities/Url';

export interface UrlRepository {
  findById(id: string): Promise<Url | null>;
  findBySlug(slug: string): Promise<Url | null>;
  findByUserId(userId: string): Promise<Url[]>;
  save(url: Url): Promise<Url>;
  update(url: Url): Promise<Url>;
  delete(id: string): Promise<void>;
  isSlugUnique(slug: string): Promise<boolean>;
}
