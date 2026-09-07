from pathlib import Path
p = Path("src/lib/seed.ts")
t = p.read_text()
t2 = t.replace('role: "admin",\n      active: true,', 'role: "admin" as const,\n      active: true,')
t2 = t2.replace('role: "admin",\n      active: false,', 'role: "admin" as const,\n      active: false,')
p.write_text(t2)
assert "SMS_OUTBOUND_ENABLED" in p.read_text()
assert "a2pMessagingServiceSid" in Path("src/lib/types.ts").read_text()
print("seed roles patched; a2p present")
