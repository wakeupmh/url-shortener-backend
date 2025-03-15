import { nanoid } from 'nanoid';

export class Url {
  private id: string;
  private originalUrl: string;
  private slug: string;
  private userId?: string | null;
  private createdAt: Date;
  private updatedAt: Date;
  private visitCount: number;

  constructor(
    originalUrl: string,
    slug?: string,
    userId?: string | null,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
    visitCount?: number
  ) {
    this.id = id || nanoid();
    this.originalUrl = originalUrl;
    this.slug = slug || nanoid(8);
    this.userId = userId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.visitCount = visitCount || 0;
  }

  public getId(): string {
    return this.id;
  }

  public getOriginalUrl(): string {
    return this.originalUrl;
  }

  public getSlug(): string {
    return this.slug;
  }

  public getUserId(): string | undefined | null {
    return this.userId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getVisitCount(): number {
    return this.visitCount;
  }

  public setOriginalUrl(originalUrl: string): void {
    this.originalUrl = originalUrl;
    this.updatedAt = new Date();
  }

  public setSlug(slug: string): void {
    this.slug = slug;
    this.updatedAt = new Date();
  }

  public incrementVisitCount(): void {
    this.visitCount += 1;
    this.updatedAt = new Date();
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      originalUrl: this.originalUrl,
      slug: this.slug,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      visitCount: this.visitCount,
    };
  }
}
