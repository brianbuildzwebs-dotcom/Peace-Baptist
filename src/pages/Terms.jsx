import React from "react";
import { Link } from "react-router-dom";
import LegalDocument from "@/components/church/LegalDocument";
import { churchInfo } from "@/lib/churchInfo";

const LAST_UPDATED = "July 2, 2026";

export default function Terms() {
  return (
    <LegalDocument label="Legal" title="Terms of Use" updated={LAST_UPDATED}>
      <p>
        Welcome to the {churchInfo.name} website. By accessing or using this site, you agree to these Terms of Use.
        If you do not agree, please do not use the site.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">About this site</h2>
      <p>
        This website provides information about our church, services, events, media, prayer ministry, and related
        online tools. Content is offered for ministry and community purposes.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Acceptable use</h2>
      <p>You agree not to:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Use the site for unlawful, harmful, or abusive purposes</li>
        <li>Attempt to disrupt, hack, or overload the site or its systems</li>
        <li>Submit false, misleading, or infringing content</li>
        <li>Harass staff, volunteers, or other visitors</li>
        <li>Scrape or automate access in ways that harm site performance</li>
      </ul>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">User-submitted content</h2>
      <p>
        When you submit prayer requests, messages, form responses, RSVPs, or other content, you represent that you have
        the right to share that information. Public prayer requests may be displayed to other visitors. Please submit
        only content you are comfortable sharing in a church community setting.
      </p>
      <p>
        We may remove content that is inappropriate, spam, or inconsistent with our ministry standards.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Intellectual property</h2>
      <p>
        Unless otherwise noted, website text, graphics, logos, sermon media, and design elements are owned by{" "}
        {churchInfo.name} or used with permission. You may view and share links to our content for personal,
        non-commercial use. You may not copy, redistribute, or commercially exploit site materials without written
        permission, except where allowed by law.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Third-party links and tools</h2>
      <p>
        The site may link to third-party services such as Google Maps, Facebook, YouTube, or giving platforms. We are
        not responsible for the content or privacy practices of those services. Your use of third-party tools is
        governed by their own terms and policies.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Disclaimer</h2>
      <p>
        This site and its content are provided "as is" for general information and ministry purposes. We strive for
        accuracy but do not warrant that all information is complete, current, or error-free. Spiritual guidance shared
        online does not replace pastoral care, counseling, or emergency assistance.
      </p>
      <p>
        If you are in crisis or need immediate help, contact local emergency services or a qualified professional.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {churchInfo.name} and its leaders, staff, and volunteers are not
        liable for damages arising from your use of the site, inability to access the site, or reliance on information
        published here.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Privacy</h2>
      <p>
        Our collection and use of personal information is described in our{" "}
        <Link to="/privacy" className="text-gold hover:text-gold-light">
          Privacy Policy
        </Link>
        . By using the site, you also agree to that policy.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of North Carolina, without regard to conflict-of-law rules.
        Disputes will be handled in courts located in North Carolina, unless applicable law requires otherwise.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Changes</h2>
      <p>
        We may update these Terms from time to time. The "Last updated" date above shows when they were last revised.
        Continued use of the site after changes means you accept the updated Terms.
      </p>

      <h2 className="font-heading text-xl font-bold text-navy mt-8 mb-3">Contact</h2>
      <p>Questions about these Terms may be sent to:</p>
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