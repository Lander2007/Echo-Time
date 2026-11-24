import React from 'react';
import { TactileAudioEngine } from '@/lib/audio';
import { CANONICAL_CONTENT } from '@/data/content';
import { BrandLogo } from '@/components/BrandLogo';

interface FooterColophonProps {
  scrollToTarget: (target: string) => void;
  getAudio: () => TactileAudioEngine;
}

export const FooterColophon: React.FC<FooterColophonProps> = ({
  scrollToTarget,
  getAudio,
}) => {
  const linkTargets: Record<string, string> = {
    'Explore skills': '#act-marketplace',
    'Community': '#act-architecture',
    'Create an account': '/login',
    'Why Echo Time': '#act-thesis',
    'How it works': '#act-marketplace',
    'FAQs': '#act-faq',
    'Log in': '/login',
    'Sign up': '/login',
    'Privacy & Terms': '#act-hero',
  };

  return (
    <footer className="py-16 px-5 sm:px-10 border-t border-strong bg-theme text-ink">
      <div className="max-w-[1380px] w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-strong">
          <div className="md:col-span-5">
            <BrandLogo surface="light" size="sm" showTagline={false} />
            <p className="mt-3 font-swiss-sans text-xs text-muted max-w-sm leading-relaxed">
              {CANONICAL_CONTENT.footer.subtitle}
            </p>
            <div className="mt-4 font-swiss-mono text-[10.5px] text-muted">
              {CANONICAL_CONTENT.footer.category}
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {CANONICAL_CONTENT.footer.columns.map((col) => (
              <div key={col.title}>
                <div className="font-swiss-mono text-[10px] uppercase tracking-[0.16em] text-muted font-semibold mb-3">
                  {col.title}
                </div>
                {col.links ? (
                  <ul className="space-y-2 font-swiss-sans text-xs">
                    {col.links.map((link) => {
                      const href = linkTargets[link] || '#act-hero';
                      return (
                        <li key={link}>
                          <a
                            href={href}
                            onClick={(e) => {
                              if (href.startsWith('#')) {
                                e.preventDefault();
                                getAudio().click();
                                scrollToTarget(href);
                              }
                            }}
                            className="text-ink/80 hover:text-accent transition-colors"
                          >
                            {link}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="font-swiss-sans text-xs text-muted leading-relaxed">
                    {col.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-swiss-mono text-[10.5px] text-muted">
          <div>{CANONICAL_CONTENT.footer.copyright}</div>
          <button
            type="button"
            data-cursor="TOP"
            onClick={() => {
              getAudio().click();
              scrollToTarget('#act-hero');
            }}
            className="hover:text-accent transition-colors"
          >
            Back to top &uarr;
          </button>
        </div>
      </div>
    </footer>
  );
};
