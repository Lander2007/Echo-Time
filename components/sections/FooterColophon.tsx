import React from 'react';
import { TactileAudioEngine } from '@/lib/audio';

interface FooterColophonProps {
  scrollToTarget: (target: string) => void;
  getAudio: () => TactileAudioEngine;
}

export const FooterColophon: React.FC<FooterColophonProps> = ({
  scrollToTarget,
  getAudio,
}) => {
  return (
            <footer className="py-12 px-5 sm:px-10">
              <div className="max-w-[1380px] w-full mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-5">
                    <div className="font-swiss-sans font-black uppercase text-lg tracking-[-0.04em] text-ink">
                      ECHO{' '}
                      <span className="font-swiss-mono font-medium text-sm tracking-[0.06em] text-accent">
                        TIME
                      </span>
                    </div>
                    <p className="mt-2 font-swiss-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                      SWISS EDITORIAL COLOPHON &mdash; PEER-TO-PEER UNIVERSITY TIME BANKING
                      &middot; 1.00 HR = 1.00 ECHO
                    </p>
                  </div>

                  <div className="md:col-span-4 flex flex-wrap gap-5 font-swiss-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    {[
                      { href: '#act-thesis', label: 'Guillotine' },
                      { href: '#act-workflow', label: 'Patchboard' },
                      { href: '#act-marketplace', label: 'SBB Board' },
                      { href: '#act-escrow', label: 'Audit Tape' },
                      { href: '#act-architecture', label: 'Stress Test' },
                    ].map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          getAudio().click();
                          scrollToTarget(item.href);
                        }}
                        className="hover:text-accent transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>

                  <div className="md:col-span-3 md:text-right">
                    <button
                      type="button"
                      data-cursor="TOP"
                      onClick={() => {
                        getAudio().click();
                        scrollToTarget('#act-hero');
                      }}
                      className="magnetic btn-roll px-5 py-2.5 rounded border border-strong hover:border-accent font-swiss-mono text-[11px] uppercase tracking-[0.14em] text-ink"
                    >
                      <span className="btn-roll-inner">
                        <span className="btn-roll-text">Back to Portal &uarr;</span>
                        <span className="btn-roll-text-clone" aria-hidden="true">
                          Back to Portal &uarr;
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </footer>

  );
};
