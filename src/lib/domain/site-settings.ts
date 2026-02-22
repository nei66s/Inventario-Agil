import { getPool } from '@/lib/db';

export type SiteSettings = {
  companyName: string;
  platformLabel: string;
  logoUrl: string | null;
  logoDataUrl: string | null;
  logoContentType: string | null;
  updatedAt: string;
};

export type SiteSettingsUpdate = Partial<{
  companyName: string;
  platformLabel: string;
  logoUrl: string | null;
  logoData: Buffer | null;
  logoContentType: string | null;
}>;

const PRIMARY_SITE_ID = 'primary';

async function createDefaults() {
  await getPool().query(
    `
      INSERT INTO site_settings (id, company_name, platform_label)
      VALUES ($1, 'Black Tower X', 'Plataforma SaaS')
      ON CONFLICT (id) DO NOTHING
    `,
    [PRIMARY_SITE_ID]
  );
}

function formatRow(row: {
  company_name: string;
  platform_label: string;
  logo_url: string | null;
  logo_data: Buffer | null;
  logo_content_type: string | null;
  updated_at: Date;
}): SiteSettings {
  return {
    companyName: row.company_name,
    platformLabel: row.platform_label,
    logoUrl: row.logo_url,
    logoDataUrl: row.logo_data
      ? `data:${row.logo_content_type ?? 'image/png'};base64,${row.logo_data.toString('base64')}`
      : null,
    logoContentType: row.logo_content_type,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  await createDefaults();
  const result = await getPool().query(
    'SELECT company_name, platform_label, logo_url, logo_data, logo_content_type, updated_at FROM site_settings WHERE id = $1',
    [PRIMARY_SITE_ID]
  );
  if (result.rowCount === 0) {
    throw new Error('Site settings are not available');
  }
  return formatRow(result.rows[0]);
}

export async function updateSiteSettings(update: SiteSettingsUpdate): Promise<SiteSettings> {
  if (!update || Object.keys(update).length === 0) {
    return getSiteSettings();
  }

  const assignments: string[] = [];
  const params: unknown[] = [];

  if (update.companyName !== undefined) {
    assignments.push(`company_name = $${params.length + 1}`);
    params.push(update.companyName);
  }

  if (update.platformLabel !== undefined) {
    assignments.push(`platform_label = $${params.length + 1}`);
    params.push(update.platformLabel);
  }

  if (Object.prototype.hasOwnProperty.call(update, 'logoUrl')) {
    assignments.push(`logo_url = $${params.length + 1}`);
    params.push(update.logoUrl);
  }

  if (Object.prototype.hasOwnProperty.call(update, 'logoData')) {
    assignments.push(`logo_data = $${params.length + 1}`);
    params.push(update.logoData);
  }

  if (Object.prototype.hasOwnProperty.call(update, 'logoContentType')) {
    assignments.push(`logo_content_type = $${params.length + 1}`);
    params.push(update.logoContentType);
  }

  assignments.push(`updated_at = now()`);

  if (params.length === 0) {
    return getSiteSettings();
  }

  const result = await getPool().query(
    `
      UPDATE site_settings
      SET ${assignments.join(', ')}
      WHERE id = $${params.length + 1}
      RETURNING company_name, platform_label, logo_url, logo_data, logo_content_type, updated_at
    `,
    [...params, PRIMARY_SITE_ID]
  );

  if (result.rowCount === 0) {
    throw new Error('Site settings not found');
  }

  return formatRow(result.rows[0]);
}
