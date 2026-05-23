import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("name").eq("user_id", user.id).maybeSingle();
      setName(data?.name ?? "");
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const deleteAll = async () => {
    if (!user) return;
    if (!confirm("Permanently delete all your analyses and batch jobs? This cannot be undone.")) return;
    const { error: e1 } = await supabase.from("analyses").delete().eq("user_id", user.id);
    const { error: e2 } = await supabase.from("batch_jobs").delete().eq("user_id", user.id);
    if (e1 || e2) toast.error("Failed to delete some data");
    else toast.success("All data deleted");
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and data.</p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} maxLength={100} />
        </div>
        <Button onClick={save} disabled={saving || loading}>{saving ? "Saving…" : "Save changes"}</Button>
      </div>

      <div className="glass-card p-5 border-negative/30 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-negative" />
          <h2 className="font-semibold text-negative">Danger zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">Permanently delete all your sentiment analyses and batch jobs.</p>
        <Button variant="destructive" onClick={deleteAll}>Delete all my data</Button>
      </div>
    </div>
  );
};

export default Settings;
