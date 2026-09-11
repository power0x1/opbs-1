import { useState } from 'react';
import type { EquityScrip, Advisory, PositionSource } from '@/types/trade';
import {
  resolveLogo,
  logoInputFromScrip,
  logoInputFromAdvisory,
  initialsFromInput,
  type LogoSource,
} from '../../utils/logo/logo';

export type ScripLogoSize = 'sm' | 'md' | 'lg';

interface ScripLogoBaseProps {
  size?: ScripLogoSize;
  source?: PositionSource;
  className?: string;
}

interface ScripLogoScripProps extends ScripLogoBaseProps {
  scrip: EquityScrip;
  advisory?: never;
}

interface ScripLogoAdvisoryProps extends ScripLogoBaseProps {
  advisory: Advisory;
  scrip?: never;
}

interface ScripLogoRawProps extends ScripLogoBaseProps {
  symbol?: string;
  name?: string;
  shortName?: string;
  slug?: string;
  logo?: string | null;
  logolarge?: string | null;
  logoLarge?: string | null;
  scrip?: never;
  advisory?: never;
}

export type ScripLogoProps =
  | ScripLogoScripProps
  | ScripLogoAdvisoryProps
  | ScripLogoRawProps;

const SIZE_CLASS: Record<ScripLogoSize, string> = {
  sm: 'scrip-logo-sm',
  md: 'scrip-logo-md',
  lg: 'scrip-logo-lg',
};

export function ScripLogo(props: ScripLogoProps) {
  const { size = 'md', source = 'liquide', className = '' } = props;
  const [errored, setErrored] = useState(false);

  let logoInput;
  if ('scrip' in props && props.scrip) {
    logoInput = logoInputFromScrip(props.scrip);
  } else if ('advisory' in props && props.advisory) {
    logoInput = logoInputFromAdvisory(props.advisory);
  } else {
    logoInput = {
      logo: props.logo,
      logolarge: props.logolarge,
      logoLarge: props.logoLarge,
      symbol: props.symbol,
      name: props.name,
      shortName: props.shortName,
      slug: props.slug,
    };
  }

  const url = source === 'liquide' ? resolveLogo(logoInput, source as LogoSource) : null;
  const initials = initialsFromInput(logoInput);
  const showImage = url && !errored;

  return (
    <div className={`scrip-logo ${SIZE_CLASS[size]} ${className}`}>
      {showImage ? (
        <img
          src={url}
          alt={logoInput.name ?? logoInput.symbol ?? ''}
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="scrip-logo-fallback">{initials}</span>
      )}
    </div>
  );
}
