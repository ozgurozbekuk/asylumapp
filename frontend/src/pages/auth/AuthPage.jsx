import { SignIn, SignUp, SignedIn, SignedOut, SignOutButton, UserButton } from '@clerk/clerk-react';
import { trTR } from '@clerk/localizations';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';

const translations = {
  en: {
    brandSubtitle: 'Asylum guidance made clear',
    securityTitle: 'Security notice',
    securityText: 'Only use asylumapp on a trusted device and network. Keep your account details private and sign out on shared computers.',
    trustedText: 'Trusted by people navigating the UK asylum process',
    backToHome: 'Back to Home',
    account: 'Account',
    navLogin: 'Log in',
    navRegister: 'Register',
    navLogout: 'Log out',
    signInTitle: 'Sign in to your asylumapp account',
    signInSubtitle: 'Access your chat history, upload documents securely, and continue where you left off.',
    newToApp: 'New to asylumapp?',
    createAccount: 'Create an account',
    createAccountTitle: 'Create your asylumapp account',
    choosePlan: 'Choose a plan to continue. You can change or cancel anytime from your account.',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    selected: 'Selected',
    planHelper: 'Selecting a plan helps us set up your account. You can switch plans later.',
      waitlistTitle: 'Pro plan coming soon',
      waitlistSubtitle:
        'Free plan includes daily limits. Add your email to the waitlist and we will let you know when pro (unlimited chats) is ready.',
      waitlistEmailPlaceholder: 'you@example.com',
      waitlistButton: 'Join pro waitlist',
      waitlistSuccess: 'You have been added to the pro waitlist.',
      waitlistError: 'Could not add you to the waitlist. Please try again.',
    plans: {
      free: {
        name: 'Free',
          description: 'Free access with daily limits.',
          features: ['AI Q&A', 'Up to 2 chats per day', 'Up to 6 questions per chat per day'],
      },
      plus: {
          name: 'Pro (coming soon)',
          description: 'Unlimited use and higher limits for regular casework (coming soon).',
          features: ['Unlimited chats (coming soon)', 'Higher daily question limits (coming soon)', 'Priority improvements as we grow'],
      },
    }
  },
  tr: {
    brandSubtitle: 'İltica rehberliği artık daha net',
    securityTitle: 'Güvenlik uyarısı',
    securityText: 'Asylumapp\'i yalnızca güvenilir bir cihazda ve ağda kullanın. Hesap bilgilerinizi gizli tutun ve ortak kullanılan bilgisayarlarda oturumu kapatın.',
    trustedText: 'Birleşik Krallık iltica sürecindeki insanlar tarafından güvenilmektedir',
    backToHome: 'Ana Sayfaya Dön',
    account: 'Hesap',
    navLogin: 'Giriş yap',
    navRegister: 'Kayıt ol',
    navLogout: 'Çıkış yap',
    signInTitle: 'Asylumapp hesabınıza giriş yapın',
    signInSubtitle: 'Sohbet geçmişinize erişin, belgeleri güvenle yükleyin ve kaldığınız yerden devam edin.',
    newToApp: 'Asylumapp\'te yeni misiniz?',
    createAccount: 'Hesap oluşturun',
    createAccountTitle: 'Asylumapp hesabınızı oluşturun',
    choosePlan: 'Devam etmek için bir plan seçin. İstediğiniz zaman hesabınızdan değiştirebilir veya iptal edebilirsiniz.',
    alreadyHaveAccount: 'Zaten bir hesabınız var mı?',
    signIn: 'Giriş yap',
    selected: 'Seçildi',
    planHelper: 'Bir plan seçmek hesabınızı kurmamıza yardımcı olur. Planları daha sonra değiştirebilirsiniz.',
      waitlistTitle: 'Pro plan yakında',
      waitlistSubtitle:
        'Ücretsiz planda günlük sınırlar vardır. Pro (sınırsız sohbet) hazır olduğunda haber almak için e-posta adresinizi bekleme listesine ekleyin.',
      waitlistEmailPlaceholder: 'siz@example.com',
      waitlistButton: 'Pro bekleme listesine katıl',
      waitlistSuccess: 'Pro bekleme listesine eklendiniz.',
      waitlistError: 'Bekleme listesine eklenemedi. Lütfen tekrar deneyin.',
    plans: {
      free: {
        name: 'Ücretsiz',
          description: 'Günlük sınırlar ile ücretsiz erişim.',
          features: ['Yapay Zeka Soru-Cevap', 'Günde en fazla 2 sohbet', 'Her sohbette günde en fazla 6 soru'],
      },
      plus: {
          name: 'Pro (yakında)',
          description: 'Düzenli kullanım için sınırsız erişim ve daha yüksek sınırlar (yakında).',
          features: ['Sınırsız sohbet (yakında)', 'Daha yüksek günlük soru sınırları (yakında)', 'Geliştirmelere öncelik'],
      },
    }
  }
};

const AuthShell = ({ children, title, subtitle, footer, lang, setLang }) => {
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50 to-white text-slate-900">
      <nav className="sticky top-0 z-40 border-b border-cyan-100/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
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
            asylumapp
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200 bg-white text-slate-700 shadow-sm transition hover:border-cyan-300 hover:shadow sm:hidden"
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
              to="/"
              className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-900 sm:inline"
            >
              {t.backToHome}
            </Link>
            <button
              onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
              className="hidden text-sm font-semibold uppercase tracking-wider text-cyan-900 hover:text-cyan-700 sm:inline"
            >
              {lang === 'en' ? 'TR' : 'EN'}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 sm:hidden">
          <div className="absolute right-0 top-0 h-full w-[280px] bg-white px-5 py-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">asylumapp</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200 text-slate-700"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="mt-6 space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl border border-cyan-200 px-3 py-2 text-sm font-semibold text-slate-800"
              >
                {t.backToHome}
              </Link>
              <SignedIn>
                <div className="flex items-center gap-3 rounded-xl border border-cyan-200 px-3 py-2">
                  <UserButton appearance={{ elements: { avatarBox: 'h-9 w-9' } }} afterSignOutUrl="/" />
                  <SignOutButton>
                    <button
                      type="button"
                      className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.navLogout}
                    </button>
                  </SignOutButton>
                </div>
              </SignedIn>
              <button
                type="button"
                onClick={() => {
                  setLang(lang === 'en' ? 'tr' : 'en');
                  setMobileMenuOpen(false);
                }}
                className="block w-full rounded-xl border border-cyan-200 px-3 py-2 text-left text-sm font-semibold text-slate-800"
              >
                {lang === 'en' ? 'TR' : 'EN'}
              </button>
              <SignedOut>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl border border-cyan-200 px-3 py-2 text-sm font-semibold text-slate-800"
                >
                  {t.navLogin}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl border border-cyan-200 px-3 py-2 text-sm font-semibold text-slate-800"
                >
                  {t.navRegister}
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen items-center justify-center px-4 py-10 text-slate-900">
        <div className="w-full max-w-6xl rounded-3xl border border-cyan-100 bg-white/80 p-6 shadow-2xl backdrop-blur-lg lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:p-10">
        <div className="flex flex-col gap-6 rounded-2xl border border-cyan-50 bg-cyan-900 px-8 py-10 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold tracking-tight text-white">
              AA
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-50">asylumapp</p>
              <p className="text-base font-medium text-cyan-100">{t.brandSubtitle}</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold lg:text-3xl">{title}</h1>
          <p className="text-sm leading-relaxed text-cyan-100/90">{subtitle}</p>
          <div className="rounded-2xl bg-white/5 p-5 text-sm leading-relaxed text-cyan-50 shadow-inner">
            <p className="font-semibold">{t.securityTitle}</p>
            <p className="mt-2">
              {t.securityText}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/90">
            <span className="h-px flex-1 bg-cyan-200/50" />
            <span className="text-center">{t.trustedText}</span>
            <span className="h-px flex-1 bg-cyan-200/50" />
          </div>
        </div>
        <div className="mt-6 lg:mt-0">
          <div className="mt-6 rounded-2xl border border-cyan-100 bg-white p-4 shadow-lg sm:p-6">
            {children}
          </div>
          <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>
        </div>
      </div>
      </div>
    </div>
  );
};

export const SignInPage = ({ language, setLanguage }) => {
  const t = translations[language];

  return (
    <AuthShell
      lang={language}
      setLang={setLanguage}
      title={t.signInTitle}
      subtitle={t.signInSubtitle}
      footer={
        <>
          {t.newToApp}{' '}
          <Link to="/register" className="font-semibold text-cyan-800 hover:text-cyan-900">
            {t.createAccount}
          </Link>
        </>
      }
    >
      <div className="flex justify-center">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/register"
          afterSignInUrl="/chat"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              formButtonPrimary: 'bg-cyan-600 hover:bg-cyan-700',
            },
          }}
          localization={language === 'tr' ? trTR : undefined}
        />
      </div>
    </AuthShell>
  );
};

export const SignUpPage = ({ language, setLanguage }) => (
  <SignUpWithPlans language={language} setLanguage={setLanguage} />
);

const SignUpWithPlans = ({ language, setLanguage }) => {
  const [plan, setPlan] = useState('free');
  const afterSignUpUrl = `/chat?plan=${plan}`;
  const t = translations[language];
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState('');

  const plans = [
    {
      id: 'free',
      price: '0',
      ...t.plans.free
    },
    {
      id: 'plus',
      price: '4/mo',
      ...t.plans.plus
    },
  ];

  return (
    <AuthShell
      lang={language}
      setLang={setLanguage}
      title={t.createAccountTitle}
      subtitle={t.choosePlan}
      footer={
        <>
          {t.alreadyHaveAccount}{' '}
          <Link to="/login" className="font-semibold text-cyan-800 hover:text-cyan-900">
            {t.signIn}
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {plans.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPlan(item.id)}
              className={`flex flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-left shadow-sm transition ${plan === item.id
                ? 'border-cyan-500 bg-cyan-50 shadow-md'
                : 'border-cyan-100 bg-white hover:-translate-y-0.5 hover:border-cyan-200'
                }`}
            >
              <div className="flex w-full items-center justify-between">
                <div className="text-lg font-semibold text-cyan-900">{item.name}</div>
                <div className="rounded-full border border-cyan-200 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                  {item.price}
                </div>
              </div>
              <div className="text-sm text-slate-700">{item.description}</div>
              <ul className="mt-1 space-y-1 text-sm text-slate-800">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-50" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan === item.id && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  {t.selected}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
          <h3 className="text-sm font-semibold text-cyan-900">{t.waitlistTitle}</h3>
          <p className="mt-1 text-xs text-slate-700">{t.waitlistSubtitle}</p>
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!waitlistEmail.trim()) return;
              try {
                setIsJoiningWaitlist(true);
                setWaitlistMessage('');
                const response = await fetch(`${API_BASE_URL}/api/waitlist`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: waitlistEmail, plan: 'pro' }),
                });
                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(payload?.message || t.waitlistError);
                }
                setWaitlistMessage(t.waitlistSuccess);
                setWaitlistEmail('');
              } catch (err) {
                setWaitlistMessage(err?.message || t.waitlistError);
              } finally {
                setIsJoiningWaitlist(false);
              }
            }}
          >
            <input
              type="email"
              value={waitlistEmail}
              onChange={(event) => setWaitlistEmail(event.target.value)}
              placeholder={t.waitlistEmailPlaceholder}
              className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:flex-1"
              required
            />
            <button
              type="submit"
              disabled={isJoiningWaitlist}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60 sm:mt-0"
            >
              {isJoiningWaitlist ? '...' : t.waitlistButton}
            </button>
          </form>
          {waitlistMessage ? (
            <p className="mt-2 text-xs text-emerald-700">
              {waitlistMessage}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-lg sm:p-6">
          <div className="flex justify-center">
            <SignUp
              path="/register"
              routing="path"
              signInUrl="/login"
              afterSignUpUrl={afterSignUpUrl}
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  formButtonPrimary: 'bg-cyan-600 hover:bg-cyan-700',
                },
              }}
              localization={language === 'tr' ? trTR : undefined}
            />
          </div>
        </div>
        <p className="text-center text-xs text-slate-600">
          {t.planHelper}
        </p>
      </div>
    </AuthShell>
  );
};
