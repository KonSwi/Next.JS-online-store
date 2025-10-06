export default function RegisterSuccessPage() {
  return (
    <main className="container py-10">
      <div className="card p-10 text-center mx-auto max-w-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/20">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="h1 text-white">Thank you!</h1>
        <p className="mt-2 text-neutral-300">You have successfully register.</p>
        <p className="mt-1 text-sm muted">
          Please check your e-mail for further information.{" "}
          <span className="cursor-not-allowed underline">Contact us</span>
        </p>

        <a href="/login" className="btn mt-6 inline-block">
          Sign in
        </a>
      </div>
    </main>
  );
}
