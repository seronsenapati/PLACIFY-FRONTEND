import React from "react";

const TermsOfService = () => {
  const handleContactClick = () => {
    window.open("https://www.linkedin.com/in/seronsenapati/", "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-400 mb-8">
          These terms of service outline the rules and regulations for the use
          of our website.
        </p>

        {/* Card Container */}
        <div className=" rounded-xl p-6 space-y-6 shadow-lg border border-neutral-800">
          {/* Introduction */}
          <section>
            <h2 className="font-bold mb-2">Introduction</h2>
            <p className="text-gray-300">
              By accessing this website we assume you accept these terms of
              service in full. Do not continue to use the website if you do not
              accept all of the terms of service stated on this page.
            </p>
          </section>

          {/* License */}
          <section>
            <h2 className="font-bold mb-2">License</h2>
            <p className="text-gray-300">
              Unless otherwise stated, we and/or our licensors own the
              intellectual property rights for all material on the website. All
              rights are reserved. You may view and/or print pages for your own
              personal use subject to restrictions set in these terms.
            </p>
          </section>

          {/* User Comments */}
          <section>
            <h2 className="font-bold mb-2">User Comments</h2>
            <p className="text-gray-300">
              Certain parts of this website offer the opportunity for users to
              post and exchange opinions, information, and material. We do not
              screen, edit, publish, or review comments prior to their
              appearance on the website and they do not reflect our views.
            </p>
          </section>

          {/* Hyperlinking */}
          <section>
            <h2 className="font-bold mb-2">Hyperlinking to our Content</h2>
            <p className="text-gray-300">
              The following organizations may link to our website without prior
              written approval: Government agencies, Search engines, News
              organizations, Online directory distributors, and Systemwide
              Accredited Businesses.
            </p>
          </section>

          {/* Content Liability */}
          <section>
            <h2 className="font-bold mb-2">Content Liability</h2>
            <p className="text-gray-300">
              We shall have no responsibility or liability for any content
              appearing on your website. You agree to indemnify and defend us
              against all claims arising out of or based upon your website.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have questions or comments about this policy, you can reach
              us at{" "}
              <a
                href="mailto:seronsenapati@gmail.com"
                className="text-blue-400 hover:underline"
              >
                seronsenapati@gmail.com
              </a>
              .
            </p>
            <button
              onClick={handleContactClick}
              className="px-5 py-2 rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition text-sm md:text-base"
            >
              Contact Me
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
