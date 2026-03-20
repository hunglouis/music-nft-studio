export function Card({ children }: any) {
  return <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>{children}</div>;
}

export function CardContent({ children }: any) {
  return <div>{children}</div>;
}
