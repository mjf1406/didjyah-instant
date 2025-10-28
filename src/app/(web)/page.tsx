/** @format */

export default function WebPage() {
    return (
        <main className="mx-auto max-w-5xl p-8">
            <section className="text-center py-16">
                <h1 className="text-4xl font-semibold tracking-tight">
                    DidjYah
                </h1>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                    Realtime todos demo built with Next.js, Tailwind, and
                    InstantDB.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                    <a
                        href="/app"
                        className="rounded-md bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
                    >
                        Open App
                    </a>
                    <a
                        href="/pricing"
                        className="rounded-md border px-5 py-2 dark:border-gray-800"
                    >
                        View Pricing
                    </a>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-8">
                <div className="rounded-lg border p-6 dark:border-gray-800">
                    <h3 className="font-medium">Realtime</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Presence and live updates powered by Instant rooms.
                    </p>
                </div>
                <div className="rounded-lg border p-6 dark:border-gray-800">
                    <h3 className="font-medium">Auth</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Google login with profile creation.
                    </p>
                </div>
                <div className="rounded-lg border p-6 dark:border-gray-800">
                    <h3 className="font-medium">Type-safe</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        End-to-end schema types via Instant.
                    </p>
                </div>
            </section>
        </main>
    );
}
