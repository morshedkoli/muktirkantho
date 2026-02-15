import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Muktir Kantho",
  description: "Learn about how Muktir Kantho uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <article className="prose-news">
        <h1 className="font-display text-3xl font-bold text-[var(--np-text-primary)] mb-8">
          Cookie Policy
        </h1>

        <div className="space-y-8 text-[var(--np-text-secondary)]">
          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
            </p>
            <p className="mt-2">
              Cookies help us enhance your user experience by remembering your preferences, understanding how you use our website, and allowing us to improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">How We Use Cookies</h2>
            <p>Muktir Kantho uses cookies for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.</li>
              <li><strong>Performance Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website.</li>
              <li><strong>Functionality Cookies:</strong> These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, more personal features.</li>
              <li><strong>Targeting/Advertising Cookies:</strong> These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-lg font-semibold text-[var(--np-text-primary)] mb-2">Session Cookies</h3>
            <p>
              These are temporary cookies that are stored in your browser during a browsing session and are deleted when you close your browser. They help the website remember your activities on the previous page.
            </p>

            <h3 className="text-lg font-semibold text-[var(--np-text-primary)] mb-2 mt-4">Persistent Cookies</h3>
            <p>
              These cookies remain on your device for a set period specified in the cookie. They are activated each time you visit the website that created that particular cookie.
            </p>

            <h3 className="text-lg font-semibold text-[var(--np-text-primary)] mb-2 mt-4">First-Party Cookies</h3>
            <p>
              These are cookies that are set by the website you are visiting and can only be read by that website.
            </p>

            <h3 className="text-lg font-semibold text-[var(--np-text-primary)] mb-2 mt-4">Third-Party Cookies</h3>
            <p>
              These are cookies set by parties other than the website owner. We may use third-party cookies for analytics, advertising, and social media integration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Specific Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-[var(--np-border)]">
                <thead>
                  <tr className="bg-[var(--np-background)]">
                    <th className="border border-[var(--np-border)] px-4 py-2 text-left text-[var(--np-text-primary)]">Cookie Name</th>
                    <th className="border border-[var(--np-border)] px-4 py-2 text-left text-[var(--np-text-primary)]">Type</th>
                    <th className="border border-[var(--np-border)] px-4 py-2 text-left text-[var(--np-text-primary)]">Purpose</th>
                    <th className="border border-[var(--np-border)] px-4 py-2 text-left text-[var(--np-text-primary)]">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[var(--np-border)] px-4 py-2">session_id</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">Essential</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">Maintains your session state</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-[var(--np-border)] px-4 py-2">theme_preference</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">Functionality</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">Remembers your theme preference (light/dark)</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-[var(--np-border)] px-4 py-2">_ga</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">Analytics</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">Google Analytics - tracks visitor interactions</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-[var(--np-border)] px-4 py-2">_gid</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">Analytics</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">Google Analytics - distinguishes users</td>
                    <td className="border border-[var(--np-border)] px-4 py-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Managing Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings preferences. You can usually find these settings in the &quot;Options&quot; or &quot;Preferences&quot; menu of your browser.
            </p>
            <p className="mt-2">
              To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-[var(--np-primary)] hover:underline">www.allaboutcookies.org</a></li>
              <li><a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-[var(--np-primary)] hover:underline">www.aboutcookies.org</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Browser-Specific Instructions</h2>
            <p>Here are links to instructions for managing cookies in popular browsers:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[var(--np-primary)] hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-[var(--np-primary)] hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[var(--np-primary)] hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[var(--np-primary)] hover:underline">Microsoft Edge</a></li>
            </ul>
            <p className="mt-4">
              Please note that disabling cookies may affect the functionality of our website and may prevent you from accessing certain features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Third-Party Analytics</h2>
            <p>
              We use Google Analytics to help us understand how our visitors use the website. Google Analytics uses cookies to collect information about your use of the website, including your IP address. This information is transmitted to and stored by Google on servers in the United States.
            </p>
            <p className="mt-2">
              Google uses this information to evaluate your use of the website, compile reports on website activity for website operators, and provide other services relating to website activity and internet usage. Google may also transfer this information to third parties where required to do so by law, or where such third parties process the information on Google&apos;s behalf.
            </p>
            <p className="mt-2">
              You can opt-out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[var(--np-primary)] hover:underline">Google Analytics Opt-out Browser Add-on</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Changes to This Cookie Policy</h2>
            <p>
              We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the &quot;Last Updated&quot; date.
            </p>
            <p className="mt-2">
              We encourage you to review this Cookie Policy periodically for any changes. Changes to this Cookie Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Cookie Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-[var(--np-background)] rounded-lg border border-[var(--np-border)]">
              <p className="mb-1"><strong>Email:</strong> editor@muktirkantho.com</p>
              <p className="mb-1"><strong>Address:</strong> 123 News Street, Dhaka-1200, Bangladesh</p>
              <p><strong>Phone:</strong> +880 1234-567890</p>
            </div>
          </section>

          <p className="text-sm text-[var(--np-text-secondary)] pt-4 border-t border-[var(--np-border)]">
            Last Updated: January 2026
          </p>
        </div>
      </article>
    </main>
  );
}
