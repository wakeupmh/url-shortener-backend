import { Url } from '../../domain/entities/Url';
import { UrlRepository } from '../../domain/repositories/UrlRepository';
import pool from '../database/connection';

export class PgUrlRepository implements UrlRepository {
  async findById(id: string): Promise<Url | null> {
    const result = await pool.query(
      'SELECT * FROM urls WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new Url(
      row.original_url,
      row.slug,
      row.user_id,
      row.id,
      row.created_at,
      row.updated_at,
      row.visit_count
    );
  }

  async findBySlug(slug: string): Promise<Url | null> {
    const result = await pool.query(
      'SELECT * FROM urls WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new Url(
      row.original_url,
      row.slug,
      row.user_id,
      row.id,
      row.created_at,
      row.updated_at,
      row.visit_count
    );
  }

  async findByUserId(userId: string): Promise<Url[]> {
    const result = await pool.query(
      'SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows.map(row => new Url(
      row.original_url,
      row.slug,
      row.user_id,
      row.id,
      row.created_at,
      row.updated_at,
      row.visit_count
    ));
  }

  async save(url: Url): Promise<Url> {
    const result = await pool.query(
      `INSERT INTO urls (
        id, original_url, slug, user_id, created_at, updated_at, visit_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        url.getId(),
        url.getOriginalUrl(),
        url.getSlug(),
        url.getUserId(),
        url.getCreatedAt(),
        url.getUpdatedAt(),
        url.getVisitCount()
      ]
    );

    const row = result.rows[0];
    return new Url(
      row.original_url,
      row.slug,
      row.user_id,
      row.id,
      row.created_at,
      row.updated_at,
      row.visit_count
    );
  }

  async update(url: Url): Promise<Url> {
    const result = await pool.query(
      `UPDATE urls SET
        original_url = $1,
        slug = $2,
        updated_at = $3,
        visit_count = $4
      WHERE id = $5 RETURNING *`,
      [
        url.getOriginalUrl(),
        url.getSlug(),
        url.getUpdatedAt(),
        url.getVisitCount(),
        url.getId()
      ]
    );

    const row = result.rows[0];
    return new Url(
      row.original_url,
      row.slug,
      row.user_id,
      row.id,
      row.created_at,
      row.updated_at,
      row.visit_count
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM urls WHERE id = $1', [id]);
  }

  async isSlugUnique(slug: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM urls WHERE slug = $1',
      [slug]
    );

    return parseInt(result.rows[0].count, 10) === 0;
  }
}
