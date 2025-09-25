import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const StepAccountInfo = () => (
    <div className="grid gap-4 pt-2 animate-in fade-in-0 duration-500">
        <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">Buat Akun Baru</h1>
            <p className="text-balance text-muted-foreground text-sm">
                Langkah pertama untuk mengelola keuangan Anda.
            </p>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="full-name">Nama Lengkap</Label>
            <Input id="full-name" placeholder="John Doe" />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="nama@contoh.com" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input id="confirm-password" type="password" />
            </div>
        </div>
    </div>
);