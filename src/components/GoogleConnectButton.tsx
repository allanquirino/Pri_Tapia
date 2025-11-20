import { Button } from "@/components/ui/button";

export default function GoogleConnectButton() {
  return (
    <Button onClick={() => { window.location.href = "/backend/api/google_oauth_redirect.php"; }}>
      Conectar Google Agenda
    </Button>
  );
}
