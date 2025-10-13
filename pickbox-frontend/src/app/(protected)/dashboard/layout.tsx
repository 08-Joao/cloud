// O middleware já protege esta rota, não é necessário verificação adicional aqui
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}