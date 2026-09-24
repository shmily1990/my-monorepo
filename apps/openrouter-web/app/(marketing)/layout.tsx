import { MarketingFooter } from "@/components/layout/marketing-footer";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * 公开站点的路由组。
 *
 * header 来自 `components/layout/site-header.tsx`（两个路由组共用），页脚只有这一组有。
 */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      {children}
      <MarketingFooter />
    </>
  );
}
