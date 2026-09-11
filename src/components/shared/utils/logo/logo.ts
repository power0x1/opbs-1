import type { EquityScrip, Advisory, FnoScrip } from '@/types/trade';

export type LogoSource = 'liquide';

export interface LogoInput {
  logo?: string | null;
  logolarge?: string | null;
  logoLarge?: string | null;
  symbol?: string;
  name?: string;
  shortName?: string;
  slug?: string;
}

const LIQUIDE_LOGO_BASE = 'https://ik.imagekit.io/liquide/';

function liquideLogoPath(key: string): string {
  return `${LIQUIDE_LOGO_BASE}${key}`;
}

function firstValid(...values: (string | null | undefined)[]): string | null {
  for (const v of values) {
    if (v && typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

export function resolveLiquideLogo(input: LogoInput): string | null {
  const logo = firstValid(
    input.logolarge,
    input.logoLarge,
    input.logo,
  );
  if (logo) return logo;

  const slug = firstValid(input.slug, input.shortName);
  if (slug) return liquideLogoPath(`${slug}.png`);

  if (input.symbol) {
    const slugified = input.symbol
      .replace(/-EQ$/, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    return liquideLogoPath(`${slugified}.png`);
  }

  return null;
}

export function resolveLogo(input: LogoInput, source: LogoSource = 'liquide'): string | null {
  void source;
  return resolveLiquideLogo(input);
}

export function logoInputFromScrip(scrip: EquityScrip): LogoInput {
  return {
    logo: scrip.logo,
    logolarge: scrip.logolarge,
    logoLarge: scrip.logoLarge,
    symbol: scrip.symbol,
    name: scrip.name,
    shortName: scrip.shortName,
    slug: scrip.slug,
  };
}

export function logoInputFromFnoScrip(scrip: FnoScrip, equityScrip?: EquityScrip): LogoInput {
  return {
    logolarge: firstValid(scrip.logolarge, scrip.logoLarge, equityScrip?.logolarge, equityScrip?.logoLarge) ?? undefined,
    logo: firstValid(scrip.logo, equityScrip?.logo) ?? undefined,
    symbol: scrip.symbol || equityScrip?.symbol,
    name: equityScrip?.name,
    shortName: equityScrip?.shortName,
    slug: equityScrip?.slug,
  };
}

export function logoInputFromAdvisory(advisory: Advisory): LogoInput {
  return {
    logo: advisory.logo,
    name: advisory.name,
  };
}

export function initialsFromInput(input: LogoInput): string {
  const source = input.shortName || input.symbol || input.name || '';
  const cleaned = source.replace(/-EQ$/, '').replace(/\d{6}.*$/, '').trim();
  if (!cleaned) return '?';
  return cleaned.slice(0, 2).toUpperCase();
}
