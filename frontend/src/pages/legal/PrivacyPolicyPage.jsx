import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const PrivacyPolicyPage = () => {
  return (
    <LegalPageLayout title="Privacy Policy" updatedAt="2026-02-13">
      <section>
        <h2 className="text-xl font-semibold text-slate-100">Overview</h2>
        <p className="mt-2">This application provides informational guidance related to UK immigration and asylum processes.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">Information We Collect</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Account email (if authentication is used)</li>
          <li>User-submitted questions and session content</li>
          <li>Optional text pasted into the system</li>
        </ul>
        <p className="mt-2">We do not request or require users to upload identity documents.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">How We Use Information</h2>
        <p className="mt-2">
          User input may be processed to generate responses using third-party AI services (e.g., OpenAI API). We do not
          sell personal data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">Data Retention</h2>
        <p className="mt-2">
          Session data may be stored so users can access previous sessions and for service improvement. Users should
          avoid submitting highly sensitive identifiers (e.g., passport numbers, Home Office reference numbers) unless
          necessary.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">Third-Party Services</h2>
        <p className="mt-2">
          We may use third-party AI providers to process submitted text in accordance with their policies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">Security</h2>
        <p className="mt-2">We use reasonable safeguards, but no system is 100% secure.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100">Contact</h2>
        <p className="mt-2">Provide a contact method for privacy questions: [INSERT_EMAIL]</p>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicyPage;
