
const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          Privacy Policy<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Your privacy is important to us.
        </p>
      </section>

      <div className="glass-card p-8 md:p-12 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-headline prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline font-content">
          <p>Welcome to Glare. This Privacy Policy describes how we collect, use, and share your personal information when you visit our website.</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information to provide and improve our services to you. The types of information we collect include:</p>
          <ul>
            <li><strong>Information You Voluntarily Submit:</strong> This may include your name, email address, and website URL when you leave a comment on the site, or contact us directly.</li>
            <li><strong>Automatically Collected Information:</strong> When you visit the Site, we automatically collect certain information about your device, including your IP address, browser type, operating system, referring URLs, device information, pages viewed, and the dates/times of your visits. This information is primarily collected through cookies and similar tracking technologies.</li>
            <li><strong>Comments:</strong> When you leave a comment on our site, we collect the data shown in the comments form, your IP address, and browser user agent string to help spam detection.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes, including to:</p>
          <ul>
            <li>Operate, maintain, and improve the Site.</li>
            <li>Respond to your comments, questions, and requests.</li>
            <li>Send you administrative communications, such as technical notices and security alerts.</li>
            <li>Send you promotional information, such as newsletters, if you have opted in to receive them. Each email will contain an unsubscribe link.</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Site.</li>
            <li>Protect against malicious activity (e.g., spamming, hacking) and ensure the security of the Site.</li>
          </ul>

          <h2>3. Cookies and Web Beacons</h2>
          <p>Glare uses cookies to store information about a visitor’s preferences and history to enhance the user experience and provide personalized content.</p>
          <ul>
            <li>You can choose to disable cookies through your individual browser options. For more detailed information about cookie management with specific web browsers, please consult your browser's official documentation.</li>
            <li>We may use third-party service providers, such as Google Analytics, to monitor and analyze the use of our Site. Google Analytics uses cookies to collect information such as how often users visit the Site and what pages they visit.</li>
          </ul>

          <h2>4. Advertising</h2>
          <p>We may use third-party advertising companies, such as Google AdSense, to serve ads when you visit our Site. These companies may use aggregated information about your visits to this and other websites to provide advertisements about goods and services of interest to you.</p>
          <ul>
            <li><strong>Google AdSense:</strong> Google uses cookies to serve ads based on a user's prior visits to our website. You can opt out of personalized advertising by visiting Google's Ads Settings.</li>
          </ul>

          <h2>5. Data Sharing and Disclosure</h2>
          <p>We will not sell, trade, or rent your personally identifiable information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners and advertisers.</p>
          <p>We may share your information with third-party vendors who perform services on our behalf (e.g.,  website analytics, advertising).</p>

          <h2>6. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access and receive a copy of the personal information we hold about you.</li>
            <li>Request that we correct or delete your personal information.</li>
            <li>Object to our processing of your personal information.</li>
            <li>Request that we restrict the processing of your personal information.</li>
          </ul>
          <p>To exercise any of these rights, please contact us using the information in the "Contact Us" section.</p>

          <h2>7. Children's Information</h2>
          <p>Glare does not knowingly collect any personally identifiable information from children under the age of 13. If you believe that a child has provided us with personal information, please contact us immediately, and we will endeavor to promptly remove such information from our records.</p>

          <h2>8. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating it. You are advised to review this Privacy Policy periodically for any changes.</p>

          <h2>9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:help.novablog@gmail.com">help.novablog@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
