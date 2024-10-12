export default function CookiePolicy() {
  return (
    <main className="policy min-h-screen">
      <h1>Manage Cookies</h1>
      <p>
        Cookies are small text files that are stored on your device when you
        visit a website. We use cookies to provide a better user experience,
        analyze how users interact with our website, and to personalize content
        and ads.
      </p>
      <p>
        Below you can manage your cookie preferences. Please note that by
        disabling certain cookies, you may limit your ability to use certain
        features of our website.
      </p>
      <h2 className="text-3xl">Cookies we use</h2>
      <p>
        We use cookies to provide a better experience on our website and to
        understand how visitors interact with our content. Here are the cookies
        we use:
      </p>
      <h3 className="text-2xl">Google Analytics</h3>
      <p>
        We use Google Analytics to collect information about how visitors use
        our website. This information is used to create reports and help us
        improve the website. Google Analytics cookies collect information in an
        anonymous form, including the number of visitors to the website and
        blog, where visitors have come to the website from and the pages they
        visited.
      </p>
      <h3 className="text-2xl">Stripe (required)</h3>
      <p>
        We use stripe as our payment gateway which allows websites to process
        online payments securely and easily. When a user makes a payment on your
        website using Stripe, their payment information (such as their credit
        card details) needs to be stored temporarily while the payment is being
        processed. Please review the{" "}
        <a className="link" href="https://stripe.com/cookie-settings">
          https://stripe.com/cookie-settings
        </a>{" "}
        settings to configure your stripe cookies.
      </p>
      <p>
        To enable this, Stripe uses cookies to store information about the
        user&apos;s session, such as their session ID and the status of their
        payment. These cookies are necessary for the payment process to work
        properly, and they are stored on the user&apos;s browser until the
        payment process is complete.
      </p>
      <p>
        In addition to payment-related cookies, Stripe may also use other
        cookies on your website to improve performance, analyze how users
        interact with the website, and provide relevant advertising. However,
        these additional cookies are optional and you can choose to disable them
        if you prefer. Stripe&apos;s use of cookies is subject to their own
        privacy policy, which you should review if you have any specific
        concerns.
      </p>
      <h3 className="text-2xl">Authentication (required)</h3>
      <p>
        We use Clerk to authenticate users on our application. Clerk is a
        service which allows users to authenticate using various third party
        services, such as google, which makes it easy to sign up and start using
        our application.
      </p>

      <h2 className="mt-12 text-4xl">Cookie Preferences</h2>
      <p>You can change your cookie settings below</p>
      <div className="mb-4 flex items-center">
        <input
          id="allow-cookies"
          type="radio"
          name="default-radio"
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          checked={true}
        />
        <label
          htmlFor="allow-cookies"
          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Allow all cookies
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="deny-cookies"
          type="radio"
          name="default-radio"
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          checked={false}
        />
        <label
          htmlFor="deny-cookies"
          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Reject all cookies
        </label>
      </div>
    </main>
  );
}
