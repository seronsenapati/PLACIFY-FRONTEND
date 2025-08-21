import React from "react";

const PrivacyPolicy = () => {
  const handleContactClick = () => {
    window.open("https://www.linkedin.com/in/seronsenapati/", "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">
          Your privacy is important to us. This privacy policy explains what
          personal data we collect and how we use it.
        </p>

        {/* Card Container */}
        <div className=" rounded-xl p-6 space-y-6 shadow-lg border border-neutral-800">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Introduction</h2>
            <p className="text-gray-300">
              We are committed to protecting your personal information and your
              right to privacy. If you have any questions or concerns about this
              policy or our practices, please contact us.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Information We Collect
            </h2>
            <p className="text-gray-300">
              We collect personal information that you voluntarily provide when
              you register on the website, express interest in our services, or
              participate in activities on the platform.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              How We Use Your Information
            </h2>
            <p className="text-gray-300">
              We use your personal information to provide and improve our
              services, communicate with you, fulfill contracts, comply with
              legal obligations, and protect our rights.
            </p>
          </section>

          {/* Sharing Your Information */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Sharing Your Information
            </h2>
            <p className="text-gray-300">
              We only share information with your consent, to comply with laws,
              provide services, protect your rights, or fulfill business
              obligations.
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

export default PrivacyPolicy;
