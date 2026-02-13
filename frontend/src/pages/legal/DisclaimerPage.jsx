import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const DisclaimerPage = () => {
  return (
    <LegalPageLayout title="Important Disclaimer" updatedAt="2026-02-13">
      <section>
        <p>This tool provides general informational guidance related to UK asylum and immigration processes.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">It is NOT:</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>A lawyer or solicitor</li>
          <li>A government authority</li>
          <li>An OISC-regulated advisor</li>
        </ul>
      </section>

      <section>
        <p>Information may not reflect your specific circumstances. Always verify critical decisions with:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>GOV.UK</li>
          <li>A qualified immigration solicitor</li>
          <li>An OISC-registered advisor</li>
        </ul>
      </section>

      <section>
        <p className="font-semibold text-amber-200">Do not rely solely on this system for legal decisions.</p>
      </section>
    </LegalPageLayout>
  );
};

export default DisclaimerPage;
