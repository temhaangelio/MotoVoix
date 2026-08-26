import { headers } from "next/headers";
import { PageLoading } from "./components/page-loading";

export default async function Loading() {
  const pathname = (await headers()).get("x-motovoix-path") || "";
  const isAdmin = pathname.startsWith("/admin");
  return <PageLoading variant={isAdmin ? "admin" : "site"} label={isAdmin ? "" : "Yükleniyor"} />;
}
