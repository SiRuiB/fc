export default function ContactPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="text-sm opacity-75 max-w-3xl">
          For pilots, investor demos, or partnerships, send a message. We usually reply within 24–48 hours.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-6 space-y-2 lg:col-span-2">
          <div className="text-sm font-semibold">Send a message</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <label className="grid gap-2 text-sm">
              <span className="opacity-70">Name</span>
              <input className="rounded-md border px-3 py-2" placeholder="Your name" />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="opacity-70">Email</span>
              <input className="rounded-md border px-3 py-2" placeholder="you@company.com" />
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="opacity-70">Message</span>
              <textarea
                className="rounded-md border px-3 py-2 min-h-[140px]"
                placeholder="What do you want to achieve? Which regions/HS codes?"
              />
            </label>
          </div>

          <div className="pt-3 text-sm opacity-75">
            MVP note: this form is UI-only for now. Use the email link on the right.
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 space-y-3">
          <div className="text-sm font-semibold">Email</div>
          <div className="text-sm opacity-75">
            Replace this with your real email when ready.
          </div>

          <a
            className="inline-flex rounded-md border bg-neutral-900 text-white px-4 py-2 text-sm hover:opacity-90"
            href="mailto:hello@futurecommodities.ai?subject=Future%20Commodities%20Pilot&body=Hi%20Sirui%2C%0A%0AWe%20want%20to%20discuss%20a%20pilot%20for%20policy%20risk%20workflows.%0A%0ARegion%3A%20%0AUse%20case%3A%20%0A%0AThanks!"
          >
            Email us
          </a>

          <div className="rounded-xl border bg-neutral-50 p-4 text-xs opacity-75">
            Tip for investor demo: keep contact simple and credible. You can wire up a real form later.
          </div>
        </div>
      </section>
    </div>
  );
}