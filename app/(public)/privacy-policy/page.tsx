import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Muktir Kantho",
  description: "Learn how Muktir Kantho collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <article className="prose-news">
        <h1 className="font-display text-3xl font-bold text-[var(--np-text-primary)] mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-[var(--np-text-secondary)]">
          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Introduction</h2>
            <p>
              Muktir Kantho (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p>
              By accessing or using Muktir Kantho, you agree to the terms of this Privacy Policy. If you do not agree with the terms, please do not access the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-[var(--np-text-primary)] mb-2">Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide to us when you:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Subscribe to our newsletter</li>
              <li>Contact us through our website</li>
              <li>Submit comments or feedback</li>
              <li>Use our admin panel services</li>
            </ul>
            <p className="mt-2">This information may include your name, email address, phone number, and any other information you choose to provide.</p>

            <h3 className="text-lg font-semibold text-[var(--np-text-primary)] mb-2 mt-4">Non-Personal Information</h3>
            <p>We automatically collect certain information when you visit our website, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages you visit on our site</li>
              <li>Time and date of your visit</li>
              <li>Time spent on pages</li>
              <li>Referring website addresses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>To provide and maintain our services</li>
              <li>To notify you about changes to our services</li>
              <li>To allow you to participate in interactive features</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our services</li>
              <li>To monitor the usage of our services</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To send you newsletters and updates (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
            </p>
            <p className="mt-2">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Third-Party Services</h2>
            <p>
              We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, perform service-related services, or assist us in analyzing how our service is used. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Data Security</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Your Data Protection Rights</h2>
            <p>Depending on your location, you may have the following data protection rights:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The right to access, update, or delete your personal information</li>
              <li>The right to rectification if your information is inaccurate or incomplete</li>
              <li>The right to object to our processing of your personal data</li>
              <li>The right to restrict processing of your personal data</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Children&apos;s Privacy</h2>
            <p>
              Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
            </p>
            <p className="mt-2">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--np-text-primary)] mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
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
