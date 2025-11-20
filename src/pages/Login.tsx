import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/services/database";
import { sessionService } from "@/services/session";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (sessionService.isAuthenticated()) {
      navigate("/admin");
    }
  }, [navigate]);

  // Load remembered credentials if available
  useEffect(() => {
    const rememberedUser = db.getSession('rememberedUser');
    if (rememberedUser) {
      setUsername(rememberedUser.username || "");
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Authenticate user with database
      const user = await db.authenticateUser(username, password);
      
      if (user) {
        // Create session
        await sessionService.createSession(user, rememberMe);
        
        // Store remember me preference
        if (rememberMe) {
          db.setSession('rememberMe', true);
          db.setSession('rememberedUser', { username, password });
        } else {
          db.removeSession('rememberMe');
          db.removeSession('rememberedUser');
        }

        // Track activity
        await sessionService.trackActivity();
        
        navigate("/admin");
      } else {
        setError("Login ou senha incorretos.");
        // Log failed attempt
        await db.addAuditLog({
          action: 'Failed Login Attempt',
          user: username,
          details: 'Invalid credentials provided',
          module: 'Authentication'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Erro interno. Tente novamente.");
      // Log error
      await db.addAuditLog({
        action: 'Login Error',
        user: username,
        details: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'Authentication'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4 page-transition">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            Área Administrativa
          </CardTitle>
          <p className="text-muted-foreground">ONG PriTapia</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Login</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Digite seu usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Digite sua senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="remember" className="text-sm">
                Lembrar de mim
              </Label>
            </div>
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate("/")}
              disabled={loading}
            >
              ← Voltar ao Site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
