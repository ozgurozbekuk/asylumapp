import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const TermsOfServicePage = () => {
  return (
    <LegalPageLayout title="Terms of Service" updatedAt="2026-02-13">
      <section>
        <h2 className="text-xl font-semibold text-slate-100">No Legal Advice</h2>
        <p className="mt-2">
          This service does not provide legal advice. It is not a substitute for a qualified immigration solicitor or
          OISC-registered advisor.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">User Responsibility</h2>
        <p className="mt-2">
          You are responsible for verifying information with official UK sources such as GOV.UK and for any decisions
          you make.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">Acceptable Use</h2>
        <p className="mt-2">
          You must not attempt to abuse, overload, scrape, reverse engineer, or disrupt the service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">Service Availability</h2>
        <p className="mt-2">The service may be modified, limited, or discontinued at any time.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">Limitation of Liability</h2>
        <p className="mt-2">
          To the maximum extent permitted by law, the creator of this application is not liable for any losses arising
          from reliance on the information provided.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">Contact</h2>
        <p className="mt-2">[INSERT_EMAIL]</p>
      </section>
    </LegalPageLayout>
  );
};

export default TermsOfServicePage;
