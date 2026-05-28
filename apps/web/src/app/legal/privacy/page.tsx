export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 leading-7 shadow">
        <p>
          Cannabinoid Observatory Europe collects data necessary for the service to function:
          account email, reports, adverse effect declarations, submitted evidence, and audit logs
          related to sensitive actions.
        </p>
        <p>
          IP addresses are not stored in plain text. They are transformed into cryptographic
          hashes with a private salt to limit abuse while reducing stored personal data.
        </p>
        <p>
          Cookies used serve to maintain the session, protect forms, and display the age gate.
          They are necessary for the service and are not used for advertising.
        </p>
        <p>
          A user may request deletion of their account from their personal space. Their
          contributions are then anonymized to preserve the public interest of the map.
        </p>
      </div>
    </div>
  );
}
