import React from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";

export default function Register() {
  return (
    <AuthLayout
      icon={UserPlus}
      title="Admin accounts only"
      subtitle="Peace Baptist admin access is created by the site administrator"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to log in
        </Link>
      }
    >
      <p className="text-sm text-foreground text-center mb-6">
        Public registration is not available. If you need admin access, contact the church office or your site administrator.
      </p>
      <Button asChild className="w-full h-12 font-medium">
        <Link to="/login">Go to log in</Link>
      </Button>
    </AuthLayout>
  );
}