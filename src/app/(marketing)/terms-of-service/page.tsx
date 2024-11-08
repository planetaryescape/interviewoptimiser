import { config } from "@/lib/config";

export const dynamic = "force-static";

export default function TermsOfService() {
  return (
    <div className="mx-auto w-full container px-4 lg:px-20 pt-12 flex justify-center">
      <article className="prose dark:prose-invert max-w-2xl pb-10 w-full">
        <h1>Terms of Service</h1>
        <h2>Liability</h2>
        <p>
          Our commitment to providing this service is founded on the principles
          of transparency and user responsibility. It is important to understand
          the following regarding liability:
        </p>
        <p>
          <strong>No Warranty or Guarantee:</strong> We provide this service
          &lsquo;as-is&rsquo; and without any warranty or guarantee. While we
          make every effort to ensure the functionality, security, and
          reliability of our site, we do not make any representations or
          warranties regarding the accuracy, completeness, or suitability of the
          information and materials found or offered on this website.
        </p>
        <p>
          <strong>Exclusion of Liability:</strong> In no event shall we be
          liable for any direct, indirect, incidental, consequential, special,
          or exemplary damages, including but not limited to, damages for loss
          of profits, goodwill, use, data, or other intangible losses, resulting
          from the use or inability to use our services.
        </p>
        <p>
          <strong>User Responsibility:</strong> You acknowledge and agree that
          your use of this service is at your own risk. We are not responsible
          for any damages or issues that may arise, including but not limited
          to, data loss, system errors, or interruptions in service. It is your
          responsibility to take appropriate precautions and ensure that any
          services or information obtained through our site meet your specific
          requirements.
        </p>
        <p>
          <strong>Indemnification:</strong> By using this service, you agree to
          indemnify and hold us harmless from any claims, actions, damages,
          liabilities, costs, and expenses, including reasonable attorneys&apos;
          fees, arising out of or in connection with your use of the service or
          any violation of these terms.
        </p>
        <p>
          It&apos;s important to review and understand these terms fully. If you
          do not agree with any part of these terms, your only recourse is to
          discontinue your use of the service.
        </p>
        <h2>User-Provided Content</h2>
        <p>
          By using {config.projectName}, you understand that any CV data
          uploaded is provided voluntarily and at your discretion. You are
          solely responsible for the accuracy, legality, and appropriateness of
          the content you upload. {config.projectName} does not verify the
          content of user-uploaded CVs.
        </p>
        <h2>Data Deletion and Account Termination</h2>
        <p>
          You may delete any uploaded CV data at any time. Additionally, you may
          choose to delete your account, which will result in the deletion of
          all associated data, including any uploaded CVs, account information,
          and preferences. Once deleted, this data is not recoverable.
        </p>
        <h2>Account</h2>
        <p>
          By creating an account on this website, you acknowledge and agree to
          the following terms regarding your account:
        </p>
        <p>
          <strong>Account Management:</strong> We reserve the right to manage
          your account at our discretion. This includes the right to delete,
          suspend, or lock your account and associated data without prior
          notice. Such actions may be taken for reasons including, but not
          limited to, violation of our terms of service, suspected fraudulent
          activities, or any other actions that may compromise the security and
          integrity of our platform.
        </p>
        <p>
          <strong>Termination:</strong> We may terminate or suspend your account
          for any reason, including breach of these terms. In the event of
          termination, you will no longer have access to your account and any
          data associated with it. We are not liable for any loss or damage that
          may result from the termination of your account.
        </p>
        <p>
          <strong>Account Security:</strong> It is your responsibility to
          maintain the security of your account credentials. You agree not to
          share your login information with third parties. You are solely
          responsible for any activities that occur under your account.
        </p>
        <p>
          <strong>Account Data:</strong> You can delete your account and all the
          associated data we store in our system at any time by going to your{" "}
          <a
            href={`https://accounts.${config.baseUrl}/user`}
            className="dark:text-white"
          >
            account settings
          </a>{" "}
          page and deleting your account. Just note that once your account is
          deleted, there is no way to recover your data.
        </p>
        <h2>Changes to Terms</h2>
        <p>
          {config.projectName} reserves the right to update these Terms of
          Service at any time. Any changes will be communicated to users, and
          continued use of the service after the date of the updated Terms will
          signify your acceptance of the changes.
        </p>
        <p>Last Modified: 11 October 2024</p>
      </article>
    </div>
  );
}
