"use client";

import Link from "next/link";
import { useAuthContext } from "@/lib/auth-context";
import {
  ArrowRight,
  CheckCircle,
  BarChart3,
  Lock,
  Zap,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-blue-950 to-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-blue-950 to-zinc-950 overflow-hidden ">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none ">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent hover:from-blue-300 hover:to-blue-500 transition-all duration-300"
        >
          Invoice<span className="text-emerald-400">Pro</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-6 py-2.5 text-white hover:text-blue-300 font-medium transition-colors duration-300 hover:underline underline-offset-4"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/75 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-32 max-w-7xl mx-auto text-center">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              Introducing InvoicePro 2.0
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            Your Invoicing
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
              Supercharged
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create professional invoices, manage customers, and track payments
            with the most intuitive platform built for modern businesses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/auth/register"
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-bold shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/75 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/auth/login"
              className="px-10 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition-all duration-300 hover:border-white/40 flex items-center gap-2"
            >
              Watch Demo
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-400" />
              <span className="text-sm text-zinc-300">
                <strong className="text-white">2000+</strong> Active Users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-blue-400" />
              <span className="text-sm text-zinc-300">
                <strong className="text-white">99.9%</strong> Uptime
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={20} className="text-emerald-400" />
              <span className="text-sm text-zinc-300">
                <strong className="text-white">Bank-Grade</strong> Security
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="relative px-6 py-24 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">
          Powerful Features
        </h2>
        <p className="text-center text-zinc-400 mb-16 max-w-2xl mx-auto">
          Everything you need to run your invoicing business efficiently
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <BarChart3 size={32} className="text-blue-400" />,
              title: "Advanced Analytics",
              description:
                "Real-time dashboards and detailed reports to understand your business",
              color: "from-blue-600/20 to-blue-400/10",
            },
            {
              icon: <Lock size={32} className="text-emerald-400" />,
              title: "Enterprise Security",
              description:
                "Bank-level encryption and compliance with global standards",
              color: "from-emerald-600/20 to-emerald-400/10",
            },
            {
              icon: <Zap size={32} className="text-yellow-400" />,
              title: "Lightning Speed",
              description: "Optimized performance for seamless invoicing",
              color: "from-yellow-600/20 to-yellow-400/10",
            },
            {
              icon: (
                <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              ),
              title: "Smart Reminders",
              description: "Automated payment reminders to boost collection rates",
              color: "from-purple-600/20 to-purple-400/10",
            },
            {
              icon: (
                <svg className="w-8 h-8 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              ),
              title: "Easy to Use",
              description: "Intuitive interface designed for simplicity",
              color: "from-pink-600/20 to-pink-400/10",
            },
            {
              icon: (
                <svg className="w-8 h-8 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.38-3-2.15 0-.94 1.08-1.64 2.73-1.64 1.36 0 2.26.72 2.44 2h2.98c-.35-2.51-2.36-4.3-5.44-4.3-3.52 0-5.44 2.15-5.44 4.09 0 1.95 1.44 3.06 3.59 3.56 2.36.51 2.72 1.3 2.72 2.15 0 .93-.64 1.64-2.04 1.64-1.31 0-2.3-.72-2.53-1.91h-2.97c.4 2.73 2.3 4.36 5.5 4.36 3.42 0 5.77-2.06 5.77-4.38 0-2.15-1.49-3.1-3.87-3.68zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              ),
              title: "Flexible Pricing",
              description: "Pay only for what you use, no hidden fees",
              color: "from-indigo-600/20 to-indigo-400/10",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`group relative bg-gradient-to-br ${feature.color} border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300 transform hover:scale-105`}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="mb-4 p-3 w-fit bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative px-6 py-24 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">
          Trusted by Businesses
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "InvoicePro has transformed how I manage invoices. It's intuitive and powerful.",
              author: "Sarah Chen",
              company: "Digital Agency",
              avatar: "🧑‍💼",
            },
            {
              quote: "The best invoicing platform I've used. Customer support is exceptional.",
              author: "Mike Rodriguez",
              company: "Consulting Firm",
              avatar: "👨‍💻",
            },
            {
              quote: "Finally, an invoicing tool that doesn't feel like a chore to use.",
              author: "Emma Watson",
              company: "Freelance Designer",
              avatar: "👩‍🎨",
            },
          ].map((testimonial, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-zinc-100 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-zinc-400">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-24 max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 rounded-3xl backdrop-blur-sm p-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-zinc-200 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses using InvoicePro to streamline their
            invoicing workflow
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-bold shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/75 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 group"
          >
            Start Your Free Trial Now
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">InvoicePro</h3>
              <p className="text-zinc-400 text-sm">
                Modern invoicing for modern businesses
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-zinc-500 text-sm">
            <p>&copy; 2024 InvoicePro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

 