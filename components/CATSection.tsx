import React from "react";
import Button from "./Button";
import { Server } from "lucide-react";
function CATSection() {
  return (
    <section className="py-32 bg-[var(--color-bg)] text-center">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <Server className="w-12 h-12 text-[var(--color-ink)] mx-auto mb-8 stroke-1" />
          <h2 className="text-4xl md:text-5xl font-medium text-[var(--color-ink)] mb-6 tracking-tight">
            ابدأ بناء مستقبلك البرمجي.
          </h2>
          <p className="text-[var(--color-ink-muted)] text-lg mb-10 font-light">
            انضم للنخبة. استخدم الأدوات التي يستخدمها كبار المهندسين في الشركات
            العالمية.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="default" size="lg" className="w-full sm:w-auto">
              أنشئ حساب
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              تواصل معنا
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CATSection;
