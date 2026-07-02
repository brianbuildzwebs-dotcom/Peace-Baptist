import React from "react";
import LegalDocument from "@/components/church/LegalDocument";
import { churchInfo } from "@/lib/churchInfo";

const LAST_UPDATED = "July 2, 2026";

export default function Privacy() {
  return (
    <LegalDocument label="Legal" title="Privacy Policy" updated={LAST_UPDATED}>
      <p>
        {churchInfo.name} ("Peace Baptist," "we," "us," or "our") operates{" "}
        <a href="https://www.peacebaptist.net" className="text-gold hover:text-gold-light">
          peacebaptist.net
        </a>{" "}
        and related online services. This Privacy Policy explains how we collect, use, and protect personal information
        when you visit our website, use our app, submit forms, or interact with our ministry online.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Information we collect</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Information you provide:</strong> name, email address, phone number, prayer requests, contact
          messages, event RSVPs and sign-ups, form submissions, and any other details you choose to share.
        </li>
        <li>
          <strong>Account information:</strong> if you sign in to the admin area, we store authentication tokens
          locally in your browser and process credentials through our authentication provider.
        </li>
        <li>
          <strong>Device and usage information:</strong> basic technical data such as browser type, device type, and
          pages visited. We do not currently run advertising or analytics trackers, but if enabled in the future they
          will load only with your consent.
        </li>
        <li>
          <strong>Push notification data:</strong> if you opt in to alerts, we store a push subscription so we can send
          church announcements you request.
        </li>
        <li>
          <strong>Local storage:</strong> your browser may store preferences such as cookie choices, app install state,
          notification settings, and chat display name to improve your experience.
        </li>
      </ul>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">How we use information</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Respond to contact messages and ministry requests</li>
        <li>Display public prayer requests you choose to share</li>
        <li>Manage event registrations and custom form submissions</li>
        <li>Send push notifications you have requested</li>
        <li>Operate, secure, and improve our website and admin tools</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">What we do not do</h2>
      <p>
        We do <strong>not</strong> sell your personal information. We do <strong>not</strong> share your information
        for cross-context behavioral advertising. We do <strong>not</strong> knowingly collect personal information from
        children under 13 without parental consent.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Service providers</h2>
      <p>We use trusted providers to host and operate the site, including:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Supabase</strong> — database, authentication, and file storage for site content and submissions
        </li>
        <li>
          <strong>Vercel</strong> — website hosting and API delivery
        </li>
        <li>
          <strong>Google</strong> — embedded maps on our Contact page and web fonts (maps load only if you allow
          functional cookies)
        </li>
        <li>
          <strong>Resend or similar email services</strong> — transactional email when configured by administrators
        </li>
      </ul>
      <p>These providers process data on our behalf under their own privacy terms and security practices.</p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Cookies and similar technologies</h2>
      <p>
        Essential cookies and local storage are used so the site can function — for example, remembering your sign-in
        session and your cookie preference choice. Optional functional tools, such as embedded Google Maps, load only
        if you accept functional cookies or choose "Accept all." Analytics tools are disabled today but, if added later,
        will load only with your analytics consent.
      </p>
      <p>
        You can change your choices anytime using <strong>Cookie Settings</strong> in the site footer.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Public content</h2>
      <p>
        Prayer requests submitted for public display may be visible to other visitors. Please do not include sensitive
        details you do not want shared publicly. You may submit anonymously where the form allows.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Data retention</h2>
      <p>
        We keep information only as long as needed for ministry purposes, site operation, or legal requirements.
        Administrators may delete outdated submissions, events, or records from time to time.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Your privacy rights (United States)</h2>
      <p>
        Depending on where you live, you may have rights to know what personal information we collect, request access or
        correction, request deletion, and opt out of the sale or sharing of personal information. Because we do not sell
        personal information, a "Do Not Sell or Share" request is generally not applicable, but we will honor valid
        privacy requests.
      </p>
      <p>Residents of states with consumer privacy laws — including, where applicable:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>California (CCPA/CPRA)</li>
        <li>Virginia (VCDPA)</li>
        <li>Colorado (CPA)</li>
        <li>Connecticut (CTDPA)</li>
        <li>Texas (TDPSA)</li>
        <li>Oregon (OCPA)</li>
        <li>Montana, Utah, and other states with similar laws</li>
      </ul>
      <p>
        may exercise these rights by contacting us using the information below. We will verify your request and respond
        within the time required by applicable law. If your browser sends a Global Privacy Control (GPC) signal, we
        treat it as a request to limit non-essential tracking and will default optional analytics off.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Security</h2>
      <p>
        We use reasonable administrative and technical safeguards to protect information. No website can guarantee
        perfect security, so please use caution when submitting personal information online.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The "Last updated" date at the top will reflect the most
        recent revision. Continued use of the site after changes means you accept the updated policy.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Contact us</h2>
      <p>
        To ask questions or exercise privacy rights, contact {churchInfo.name}:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Email:{" "}
          <a href={`mailto:${churchInfo.email}`} className="text-gold hover:text-gold-light">
            {churchInfo.email}
          </a>
        </li>
        <li>
          Phone:{" "}
          <a href={`tel:${churchInfo.phoneTel}`} className="text-gold hover:text-gold-light">
            {churchInfo.phone}
          </a>
        </li>
        <li>Mail: {churchInfo.address.full}</li>
      </ul>
    </LegalDocument>
  );
}