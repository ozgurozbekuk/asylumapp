import { SignedIn, SignedOut, SignOutButton, UserButton } from '@clerk/clerk-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const content = {
  en: {
    languageLabel: 'Language',
    languageName: 'English',
    nav: {
      brand: 'Asylum Assistant',
      chat: 'Chat',
      support: 'Buy Me Coffee',
      login: 'Log in',
      register: 'Register',
      logout: 'Log out',
    },
    hero: {
      badge: 'Based on official government guidance',
      title: 'Understand Your Asylum Process',
      subtitle:
        'Clear guidance, step by step — in simple language. We help you navigate the complexity with confidence.',
      primaryCta: 'Ask the Assistant',
      secondaryCta: 'Learn How it Works',
      note: 'Information provided is for guidance only. Not legal advice.',
    },
    highlight: {
      title: 'Multilingual Support',
      body: 'We explain complex terms in your preferred language.',
      image:
        'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1400&q=80',
    },
    features: [
      {
        iconBg: 'bg-amber-200',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-amber-800">
            <path
              d="M6 9.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5c0 2.038-1.114 3.81-2.765 4.756-.283.16-.467.441-.49.758l-.107 1.501c-.05.707-.08 1.06-.218 1.284-.123.2-.303.356-.517.45-.243.106-.597.051-1.303-.059l-1.932-.301a1.4 1.4 0 0 0-.897.132l-1.128.54c-.605.289-.908.433-1.18.371a.964.964 0 0 1-.615-.437c-.142-.242-.133-.575-.115-1.24l.07-2.592c.006-.236-.08-.464-.237-.64C7.053 13.4 6 11.587 6 9.5Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 10h4m-4 2h2"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        title: 'Official Guidance',
        body: 'Continuously updated to reflect the latest UK Home Office rules and regulations, so you have current information.',
      },
      {
        iconBg: 'bg-blue-200',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-blue-800">
            <path
              d="M12 7v10m-3-6h6m1.5 5.5V6.5c0-.552-.448-1-1-1h-7c-.552 0-1 .448-1 1v10c0 .552.448 1 1 1h7c.552 0 1-.448 1-1Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        title: 'Simple Language',
        body: 'We strip away confusing legal jargon and replace it with plain, easy-to-understand English so you know exactly where you stand.',
      },
      {
        iconBg: 'bg-emerald-200',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-emerald-800">
            <path
              d="M9 8h8M7 12h10M9 16h8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 17 4 12l2-5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        title: 'Step-by-Step Plans',
        body: 'We break the process into manageable, actionable steps tailored to your situation so you can stay on track.',
      },
    ],
    footer: {
      links: ['Privacy Policy', 'Terms of Service', 'Full Disclaimer'],
      supportLabel: 'Buy Me Coffee',
      supportUrl: 'https://buymeacoffee.com/rojwebdesign',
      disclaimer:
        'Asylum Assistant is an informational tool designed to help users understand the UK asylum process. We are not a law firm and do not provide legal advice. Using this site does not create a solicitor-client relationship. For legal advice regarding your case, please consult a qualified immigration solicitor or OISC-registered advisor.',
      copyrightSuffix: 'Asylum Assistant. All rights reserved.',
      infoSupportLine1: 'This app provides informational support only.',
      infoSupportLine2: 'It does not provide legal advice.',
    },
    signedInCta: 'Open chat',
  },
  tr: {
    languageLabel: 'Dil',
    languageName: 'Türkçe',
    nav: {
      brand: 'Asylum Assistant',
      chat: 'Sohbet',
      support: 'Bir Kahve Al',
      login: 'Giriş yap',
      register: 'Kayıt ol',
      logout: 'Çıkış yap',
    },
    hero: {
      badge: 'Resmî rehberlere dayanır',
      title: 'İltica sürecini anlayın',
      subtitle:
        'Adım adım, sade bir dille açıklanan net rehberlik. Sürecin karmaşasını güvenle aşmanıza yardımcı oluyoruz.',
      primaryCta: 'Asistanı Sor',
      secondaryCta: 'Nasıl çalıştığını öğren',
      note: 'Verilen bilgiler yalnızca yol göstericidir. Hukuki tavsiye değildir.',
    },
    highlight: {
      title: 'Çok Dilli Destek',
      body: 'Karmaşık terimleri tercih ettiğiniz dilde açıklarız.',
      image:
        'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1400&q=80',
    },
    features: [
      {
        iconBg: 'bg-amber-200',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-amber-800">
            <path
              d="M6 9.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5c0 2.038-1.114 3.81-2.765 4.756-.283.16-.467.441-.49.758l-.107 1.501c-.05.707-.08 1.06-.218 1.284-.123.2-.303.356-.517.45-.243.106-.597.051-1.303-.059l-1.932-.301a1.4 1.4 0 0 0-.897.132l-1.128.54c-.605.289-.908.433-1.18.371a.964.964 0 0 1-.615-.437c-.142-.242-.133-.575-.115-1.24l.07-2.592c.006-.236-.08-.464-.237-.64C7.053 13.4 6 11.587 6 9.5Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 10h4m-4 2h2"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        title: 'Resmî Rehberlik',
        body: 'En güncel UK Home Office kurallarıyla sürekli güncellenir; böylece bilgilerin güncel kalır.',
      },
      {
        iconBg: 'bg-blue-200',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-blue-800">
            <path
              d="M12 7v10m-3-6h6m1.5 5.5V6.5c0-.552-.448-1-1-1h-7c-.552 0-1 .448-1 1v10c0 .552.448 1 1 1h7c.552 0 1-.448 1-1Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        title: 'Sade Dil',
        body: 'Karmaşık hukuk dili yerine net, anlaşılır cümlelerle süreci açıklarız; tam olarak nerede durduğunu bilirsin.',
      },
      {
        iconBg: 'bg-emerald-200',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-emerald-800">
            <path
              d="M9 8h8M7 12h10M9 16h8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 17 4 12l2-5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        title: 'Adım Adım Planlar',
        body: 'Süreci yönetilebilir, uygulanabilir adımlara böleriz; durumuna uygun aksiyon önerileriyle ilerlersin.',
      },
    ],
    footer: {
      links: ['Gizlilik Politikası', 'Hizmet Şartları', 'Tüm Feragatname'],
      supportLabel: 'Bir Kahve Al',
      supportUrl: 'https://buymeacoffee.com/rojwebdesign',
      disclaimer:
        'Asylum Assistant, kullanıcıların Birleşik Krallık iltica sürecini anlamalarına yardımcı olmak için tasarlanmış bilgi amaçlı bir araçtır. Bir hukuk bürosu değiliz ve hukuki tavsiye vermeyiz. Bu siteyi kullanmak avukat-müvekkil ilişkisi oluşturmaz. Özel durumun için nitelikli bir göçmenlik avukatına veya OISC kayıtlı bir danışmana başvur.',
      copyrightSuffix: 'Asylum Assistant. Tüm hakları saklıdır.',
      infoSupportLine1: 'Bu uygulama yalnızca bilgilendirme amaçlı destek sağlar.',
      infoSupportLine2: 'Hukuki tavsiye vermez.',
    },
    signedInCta: 'Sohbete devam et',
  },
};

const Home = ({ language = 'tr', setLanguage = () => {} }) => {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const t = content[language] ?? content.en;

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'tr', label: 'Türkçe' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-[#1e2026] bg-[#0f1115]/85 backdrop-blur">
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#151821] text-emerald-300">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M12 4v16m0 0 4-4m-4 4-4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {t.nav.brand}
          </Link>

          <a
            href={t.footer.supportUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute left-1/2 hidden -translate-x-1/2 rounded-full border-2 border-amber-300 bg-amber-300 px-6 py-2.5 text-base font-extrabold text-amber-950 shadow-[0_10px_24px_-10px_rgba(252,211,77,0.95)] transition hover:scale-[1.03] hover:bg-amber-200 sm:inline-flex"
          >
            {t.nav.support}
          </a>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2d36] bg-[#151821] text-slate-300 shadow-sm transition hover:border-[#3a3d47] hover:shadow sm:hidden"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <Link
              to="/chat"
              className="hidden text-sm font-semibold text-slate-300 transition hover:text-slate-100 sm:inline"
            >
              {t.nav.chat}
            </Link>
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-[#2a2d36] bg-[#151821] px-3 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-[#3a3d47] hover:shadow"
                aria-expanded={languageMenuOpen}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-400" aria-hidden="true">
                  <path
                    d="M4 12h16M12 4v16m-6-3c2.5 2 5.5 2 8 0m-8-10c2.5-2 5.5-2 8 0"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t.languageName}
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-slate-500" aria-hidden="true">
                  <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-[#2a2d36] bg-[#151821] p-1 text-sm shadow-lg">
                  {languageOptions.map(({ code, label }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setLanguage(code);
                        setLanguageMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-[#1f222b] ${
                        language === code ? 'bg-[#1f222b] font-semibold text-slate-100' : 'text-slate-300'
                      }`}
                    >
                      {label}
                      {language === code && (
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden="true">
                          <path d="M5 10.5 8.5 14 15 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <SignedIn>
              <div className="hidden sm:block">
                <UserButton appearance={{ elements: { avatarBox: 'h-10 w-10' } }} afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <SignedOut>
              <Link
                to="/login"
                className="hidden text-sm font-semibold text-slate-300 transition hover:text-slate-100 sm:inline"
              >
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                className="hidden rounded-full border border-[#2a2d36] bg-[#151821] px-3 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-[#3a3d47] hover:shadow sm:inline"
              >
                {t.nav.register}
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 sm:hidden">
          <div className="absolute right-0 top-0 h-full w-[280px] bg-[#0b0d12] px-5 py-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-100">{t.nav.brand}</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2d36] text-slate-300"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="mt-6 space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl border border-[#2a2d36] bg-[#151821] px-3 py-2 text-sm font-semibold text-slate-200"
              >
                {t.nav.brand}
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl border border-[#2a2d36] bg-[#151821] px-3 py-2 text-sm font-semibold text-slate-200"
              >
                {t.nav.chat}
              </Link>
              <a
                href={t.footer.supportUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl bg-amber-200 px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-300"
              >
                {t.nav.support}
              </a>
              <SignedIn>
                <div className="flex items-center gap-3 rounded-xl border border-[#2a2d36] bg-[#151821] px-3 py-2">
                  <UserButton appearance={{ elements: { avatarBox: 'h-10 w-10' } }} afterSignOutUrl="/" />
                  <SignOutButton>
                    <button
                      type="button"
                      className="rounded-full border border-[#2a2d36] bg-[#0f1115] px-3 py-1 text-sm font-semibold text-slate-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.nav.logout}
                    </button>
                  </SignOutButton>
                </div>
              </SignedIn>
              <button
                type="button"
                onClick={() => {
                  setLanguage(language === 'en' ? 'tr' : 'en');
                  setMobileMenuOpen(false);
                }}
                className="block w-full rounded-xl border border-[#2a2d36] bg-[#151821] px-3 py-2 text-left text-sm font-semibold text-slate-200"
              >
                {language === 'en' ? 'TR' : 'EN'}
              </button>
              <SignedOut>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl border border-[#2a2d36] bg-[#151821] px-3 py-2 text-sm font-semibold text-slate-200"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl border border-[#2a2d36] bg-[#151821] px-3 py-2 text-sm font-semibold text-slate-200"
                >
                  {t.nav.register}
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      ) : null}

      <main className="flex min-h-screen w-full flex-col items-center px-5 pb-24">
        <section className="mt-16 w-full max-w-5xl text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-[#151821] px-4 py-2 text-xs font-semibold text-emerald-300 shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1f222b] text-emerald-300 shadow">
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="m10 3.5 1.5 3.5 3.5.5-2.6 2.6.6 3.6L10 12.5l-3 1.2.6-3.6-2.6-2.6 3.5-.5L10 3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {t.hero.badge}
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/chat"
              className="group inline-flex items-center justify-center rounded-full bg-[#ffe300] px-6 py-3 text-base font-bold text-slate-900 shadow transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {t.hero.primaryCta}
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="ml-2 h-4 w-4 transition group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-[#2a2d36] bg-[#151821] px-6 py-3 text-base font-semibold text-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3a3d47] hover:shadow"
            >
              {t.hero.secondaryCta}
            </a>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1f222b] text-[10px] font-semibold text-slate-300">
              !
            </span>
            {t.hero.note}
          </p>
        </section>

        <section className="mt-16 w-full max-w-6xl rounded-[28px] border border-[#1e2026] bg-[#111319] p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)]">
          <div className="relative overflow-hidden rounded-[24px]">
            <img
              src={t.highlight.image}
              alt={t.highlight.title}
              className="h-[340px] w-full object-cover sm:h-[420px]"
              loading="lazy"
            />
            <div className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6">
              <div className="flex max-w-xs items-start gap-3 rounded-full bg-[#151821]/95 px-4 py-3 shadow-lg backdrop-blur sm:rounded-[24px]">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-amber-200 text-amber-800">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M5 12h14M12 5v14"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{t.highlight.title}</p>
                  <p className="text-xs text-slate-300">{t.highlight.body}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mt-14 w-full max-w-5xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.map(({ iconBg, icon, title, body }) => (
              <div
                key={title}
                className="flex h-full flex-col gap-3 rounded-[24px] border border-[#1e2026] bg-[#151821] px-6 py-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>{icon}</div>
                <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20 w-full border-t border-[#1e2026] pt-8">
          <p className="mb-4 text-center text-xs font-semibold text-slate-300">
            {t.footer.infoSupportLine1}
            <br />
            {t.footer.infoSupportLine2}
          </p>
          <div className="flex flex-col items-center gap-3 text-sm font-semibold text-slate-300 sm:flex-row sm:justify-center sm:gap-6">
            <a
              href={t.footer.supportUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#2a2d36] bg-[#151821] px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-[#3a3d47] hover:shadow"
            >
              {t.footer.supportLabel}
            </a>
          </div>
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl bg-[#151821] px-5 py-4 text-center text-[11px] leading-relaxed text-slate-300 shadow-inner">
            <span className="font-semibold text-slate-100">Important Disclaimer:</span> {t.footer.disclaimer}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">© {currentYear} {t.footer.copyrightSuffix}</p>
        </footer>
      </main>
    </div>
  );
};

export default Home;
