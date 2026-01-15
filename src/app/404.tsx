import Link from "next/link";

export default function Custom404() {
  return (
    <div className="flex items-center justify-center bg-base-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary">
          404 - Page Not Found
        </h1>
        <p className="mb-4 text-base-content">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            Back to Landing
          </Link>
          <Link href="/home" className="btn btn-ghost">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
