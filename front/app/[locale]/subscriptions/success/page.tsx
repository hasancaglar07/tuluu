"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { CheckCircle, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { m } from "framer-motion";

export default function SubscriptionSuccess() {
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(false);

  // Handle logout and redirect to dashboard
  const handleLogout = async () => {
    try {
      setLoading(true);
      toast.loading("Logging out...", {
        id: "logout-loading",
      });

      await signOut({ redirectUrl: "/sign-in" });

      toast.success("Successfully logged out!", {
        id: "logout-loading",
        description: "Log back in to enjoy your premium subscription ✨",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout", {
        id: "logout-loading",
        description: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    toast.success("🎉 Payment confirmed!", {
      description: "Your premium subscription is now active",
      duration: 5000,
    });
  }, []);

  return (
    <m.div
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <m.div className="w-full max-w-md">
        <m.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <m.div
                className="mx-auto mb-4 relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.4,
                }}
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <m.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                </m.div>
              </m.div>

              <m.h1
                className="text-2xl font-bold text-gray-900 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                Payment Confirmed!
              </m.h1>

              <m.p
                className="text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                Your premium subscription has been successfully activated.
              </m.p>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <m.div
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-primary-900 mb-1">
                      Action Required
                    </h3>
                    <p className="text-sm text-primary-800">
                      To fully enjoy your new premium features, please log out
                      and log back in to your account.
                    </p>
                  </div>
                </div>
              </m.div>

              <m.div
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
              >
                <h6 className="text-gray-900 mb-3">Unlocked Features</h6>
                <ul className="text-sm text-gray-700 space-y-2 text-left">
                  {[
                    "Unlimited access to all lessons",
                    "Premium features unlocked",
                    "Unlimited hearts",
                    "No annoying ads",
                  ].map((feature, index) => (
                    <m.li
                      key={index}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + index * 0.1, duration: 0.3 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </m.li>
                  ))}
                </ul>
              </m.div>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  disabled={loading}
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg"
                  size="lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Log Out and Continue
                </Button>
              </m.div>

              <m.p
                className="text-xs text-gray-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.9, duration: 0.4 }}
              >
                You will be redirected to the dashboard after logout.
              </m.p>
            </CardContent>
          </Card>
        </m.div>
      </m.div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <m.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <m.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.25, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <m.div
          className="absolute top-3/4 left-1/3 w-16 h-16 bg-green-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.28, 0.2],
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>
    </m.div>
  );
}
