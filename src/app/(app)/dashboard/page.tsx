"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="navbar bg-base-100 border-b border-base-200">
        <div className="flex-1">
          <Link href="/dashboard" className="btn btn-ghost text-xl font-bold">
            Your App
          </Link>
        </div>
        <div className="flex-none gap-2">
          <Link href="/settings" className="btn btn-ghost">
            Settings
          </Link>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="avatar" />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full text-lg font-bold">
                    {session?.user?.name?.[0] || session?.user?.email?.[0] || "?"}
                  </div>
                )}
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link href="/settings">Settings</Link>
              </li>
              <li>
                <button onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {/* Welcome Card */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title">
                Welcome back, {session?.user?.name || session?.user?.email}!
              </h2>
              <p className="text-base-content/70">
                This is your dashboard. Start building your app from here.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-title">Total Users</div>
              <div className="stat-value">0</div>
              <div className="stat-desc">Get started by inviting users</div>
            </div>
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-title">Projects</div>
              <div className="stat-value">0</div>
              <div className="stat-desc">Create your first project</div>
            </div>
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-title">Revenue</div>
              <div className="stat-value">$0</div>
              <div className="stat-desc">Configure Stripe to get started</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/settings" className="btn btn-primary">
                  Configure Settings
                </Link>
                <Link href="/stripe/subscription-success" className="btn btn-outline">
                  View Subscription
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
