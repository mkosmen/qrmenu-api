import crypto from 'node:crypto';
import slugify from 'slugify';
import { PAGINATION } from './constant';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.SECRET_KEY || 'test';

if (!secretKey) {
  throw new Error('SECRET_KEY environment variable is required');
}

const key = crypto
  .createHash('sha512')
  .update(secretKey)
  .digest('hex')
  .substring(0, 32);

const iv = crypto.randomBytes(16);

export function encrypt(data: string) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(data, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + encrypted;
}

export function decrypt(data: string) {
  const inputIV = data.slice(0, 32);
  const encrypted = data.slice(32);
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key),
    Buffer.from(inputIV, 'hex'),
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

export function slugger(str: string) {
  return slugify(str, { lower: true });
}

export function getPagination({
  page,
  limit,
  total,
}: {
  page?: number;
  limit?: number;
  total: number;
}) {
  let _limit = Math.abs(Number(limit));
  _limit = _limit < 1 ? PAGINATION.LIMIT : _limit;

  const _page = Math.abs(Number(page));
  const maxPage = Math.ceil(total / _limit);

  return { page: _page, limit: _limit, maxPage };
}
