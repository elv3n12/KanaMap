/** Map route: full viewport under header, no extra padding */
export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <div className="-mt-14 h-screen pt-14">{children}</div>;
}
